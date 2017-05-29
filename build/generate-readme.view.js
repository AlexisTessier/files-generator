'use strict';

const path = require('path');
const licenseUrl = require("oss-license-name-to-url");

const capitalize = require('capitalize');
const dashify = require('dashify');

const pkg = require('../package.json');

const git = require('git-repo-info')();

/*--------------*/

const projectStatus = pkg.projectStatus || 'draft';

const view = Object.assign({}, pkg, {
	formatedName: capitalize.words(pkg.name.replace(/\-/g, ' ')),
	content: require('./documentation-introduction.js'),
	currentBranch: git.branch,
	licenseUrl: licenseUrl(pkg.license),
	projectStatus,
	projectStatusColor: ({
		draft: 'lightgrey',
		experimental: 'orange',
		ready: 'green',
		ok: 'brightgreen'
	})[projectStatus] || 'lightgrey'
});

/*--------------*/

view.menu = view.content.filter(block => block.section).map(({section}) => ({
	label: section,
	anchor: dashify(section)
}));

const mkdirp = require('mkdirp');

const viewFileName = path.join(__dirname, '../tmp/build/readme.view.json');

mkdirp.sync(path.dirname(viewFileName));
require('jsonfile').writeFileSync(viewFileName, view, {
	encoding: 'utf-8'
});