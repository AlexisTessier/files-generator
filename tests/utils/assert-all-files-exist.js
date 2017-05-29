'use strict';

const fs = require('fs');
const assert = require('assert');

module.exports = function assertAllFilesExist(expectedFiles) {
	assert(Array.isArray(expectedFiles));

	return Promise.all(expectedFiles.map(expectedFile => {
		assert(typeof expectedFile === 'object');
		assert(typeof expectedFile.path === 'string');
		assert(typeof expectedFile.content === 'string');

		return new Promise(resolve => {
			fs.readFile(expectedFile.path, {encoding: 'utf-8'}, (err, fileContent) => {
				assert.equal(!err, true, `${expectedFile.path} wasn't created`);
				assert.equal(`${expectedFile.path} contains => ${fileContent}`, `${expectedFile.path} contains => ${expectedFile.content}`);
				resolve();
			});
		});
	}));
}