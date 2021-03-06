'use strict';

var fs = require('fs'),
  path = require('path'),
  File = require('vinyl'),
  vfs = require('vinyl-fs'),
  _ = require('lodash'),
  concat = require('concat-stream'),
  GithubSlugger = require('github-slugger'),
  createFormatters = require('documentation').util.createFormatters,
  LinkerStack = require('documentation').util.LinkerStack,
  hljs = require('highlight.js');

var markdownToHtml = require('../markdown-to-html');

module.exports = function(
  comments /*: Array<Comment> */,
  config /*: DocumentationConfig */
) {
  var linkerStack = new LinkerStack(
    config
  ).namespaceResolver(comments, function(namespace) {
    var slugger = new GithubSlugger();
    return '#' + slugger.slug(namespace);
  });

  var formatters = createFormatters(linkerStack.link);

  hljs.configure(config.hljs || {});

  var sharedImports = {
    imports: {
      markdownToHtml,
      slug(str) {
        var slugger = new GithubSlugger();
        return slugger.slug(str);
      },
      shortSignature(section) {
        var prefix = '';
        if (section.kind === 'class') {
          prefix = 'new ';
        } else if (section.kind !== 'function') {
          return section.name;
        }
        return prefix + section.name + formatters.parameters(section, true);
      },
      signature(section) {
        var returns = '';
        var prefix = '';
        if (section.kind === 'class') {
          prefix = 'new ';
        } else if (section.kind !== 'function') {
          return null;
        }
        if (section.returns.length) {
          returns = ': ' + formatters.type(section.returns[0].type);
        }
        return prefix + section.name + formatters.parameters(section) + returns;
      },
      md(ast, inline) {
        if (
          inline &&
          ast &&
          ast.children.length &&
          ast.children[0].type === 'paragraph'
        ) {
          ast = {
            type: 'root',
            children: ast.children[0].children.concat(ast.children.slice(1))
          };
        }
        return formatters.markdown(ast);
      },
      formatType: formatters.type,
      autolink: formatters.autolink,
      highlight(example) {
        if (config.hljs && config.hljs.highlightAuto) {
          return hljs.highlightAuto(example).value;
        }
        return hljs.highlight('js', example).value;
      }
    }
  };

  sharedImports.imports.renderSectionList = _.template(
    fs.readFileSync(path.join(__dirname, 'section_list._'), 'utf8'),
    sharedImports
  );
  sharedImports.imports.renderSection = _.template(
    fs.readFileSync(path.join(__dirname, 'section._'), 'utf8'),
    sharedImports
  );
  sharedImports.imports.renderNote = _.template(
    fs.readFileSync(path.join(__dirname, 'note._'), 'utf8'),
    sharedImports
  );

  var pageTemplate = _.template(
    fs.readFileSync(path.join(__dirname, 'index._'), 'utf8'),
    sharedImports
  );

  // push assets into the pipeline as well.
  return new Promise(resolve => {
    const documentationIntroduction = require('../documentation-introduction.js');

    const introduction = [];
    let currentSection = null;
    let previousWasLi = false;
    documentationIntroduction.forEach(entry => {
      if (entry.section) {
        currentSection = {
          title: entry.section,
          content: ''
        }
        introduction.push(currentSection);
      }
      else{
        currentSection.content += '\n'+markownify(entry)+'\n';
      }
    })

    vfs.src([__dirname + '/assets/**'], { base: __dirname }).pipe(
      concat(function(files) {
        resolve(
          files.concat(
            new File({
              path: 'index.html',
              contents: new Buffer(
                pageTemplate({
                  introduction: introduction.filter(section => !['documentation', 'license'].includes(section.title.toLowerCase())),
                  docs: comments,
                  config: config
                }),
                'utf8'
              )
            })
          )
        );
      })
    );
  });
};

function markownify(entry) {
  if (entry.p) {
    return `${entry.p}`;
  }

  if (entry.li) {
    return `+ ${entry.li}`;
  }

  if (entry.cli) {
    return '```\n'+entry.cli+'\n```';
  }

  if (entry.js) {
    return '```javascript\n'+entry.js+'\n```';
  }

  if (entry.title) {
    return `#### ${entry.title}`;
  }

  if (entry.subtitle) {
    return `##### ${entry.subtitle}`;
  }

  return '';
}
