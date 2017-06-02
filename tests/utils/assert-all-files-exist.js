'use strict';

const fs = require('fs');
const assert = require('assert');

const isDirectory = require('is-directory');

module.exports = function assertAllFilesExist(expectedFiles) {
	assert(Array.isArray(expectedFiles));

	return Promise.all(expectedFiles.map(expectedFile => {
		assert(typeof expectedFile === 'object');
		assert(typeof expectedFile.path === 'string');
		assert(typeof expectedFile.content === 'string' || typeof expectedFile.content === 'boolean');

		return new Promise((resolve, reject) => {
			if (expectedFile.content === false) {
				fs.access(expectedFile.path, err => {
					assert(err && err.code === 'ENOENT', `${expectedFile.path} shouldn't exist`);
					resolve();
				});
			}
			else if (expectedFile.content === true) {
				isDirectory(expectedFile.path, (err, dir) => {
					if (err){reject(err);return;};
					assert.equal(dir, true, `${expectedFile.path} should be a directory`);
					resolve();
				});
			}
			else{
				fs.readFile(expectedFile.path, {encoding: 'utf-8'}, (err, fileContent) => {
					assert.equal(!err, true, `${expectedFile.path} wasn't created`);
					assert.equal(`${expectedFile.path} contains => ${fileContent}`, `${expectedFile.path} contains => ${expectedFile.content}`);
					resolve();
				});
			}
		});
	}));
}