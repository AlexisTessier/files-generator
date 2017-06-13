# Files Generator

![draft](https://img.shields.io/badge/stability-draft-lightgrey.svg?style=flat-square)

![Branch : master](https://img.shields.io/badge/Branch-master-blue.svg)
[![version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/AlexisTessier/files-generator#readme)
[![npm version](https://badge.fury.io/js/files-generator.svg)](https://badge.fury.io/js/files-generator)

[![Build Status](https://travis-ci.org/AlexisTessier/files-generator.svg?branch=master)](https://travis-ci.org/AlexisTessier/files-generator)
[![Coverage Status](https://coveralls.io/repos/AlexisTessier/files-generator/badge.svg?branch=master&service=github)](https://coveralls.io/github/AlexisTessier/files-generator?branch=master)

[![Dependency Status](https://david-dm.org/AlexisTessier/files-generator.svg)](https://david-dm.org/AlexisTessier/files-generator)
[![devDependency Status](https://david-dm.org/AlexisTessier/files-generator/dev-status.svg)](https://david-dm.org/AlexisTessier/files-generator#info=devDependencies)

A tool to generate bunch of files, using different kinds of content definition

-   [Install](#install)
-   [Basic usage](#basic-usage)
-   [Documentation](#documentation)
-   [License](#license)

## Install

    npm i files-generator

## Basic usage

```javascript
const generate = require('files-generator')

generate({
  'path/to/file': 'file-content',
  'path/to/file2': generate.copy('path/to/original/file'),
  'path/to/file3': new Promise(resolve => resolve('async-file-content')) 
}).then(generatedFiles => {
  console.log(generatedFiles)
  // {
  //    'path/to/file': 'file-content',
  //    'path/to/file2': 'original-file-content',
  //    'path/to/file3': 'async-file-content'
  // }
})
```

## Documentation

<!-- Generated by documentation.js. Update this documentation by updating the source code. -->

## License

files-generator is released under [MIT](http://opensource.org/licenses/MIT). 
Copyright (c) 2017-present [Alexis Tessier](https://github.com/AlexisTessier)
