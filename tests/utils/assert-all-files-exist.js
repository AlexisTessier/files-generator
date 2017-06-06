'use strict';

const fs = require('fs');
const assert = require('assert');

const isDirectory = require('is-directory');

module.exports = function assertAllFilesExist(expectedFiles, assertAllFilesExistCallback) {
	assert(Array.isArray(expectedFiles));

	const toCheckCount = expectedFiles.length;
	let checkedCount = 0;

	function poll(){
		if (checkedCount >= toCheckCount) {
			assertAllFilesExistCallback();
		}
	}

	poll();

	expectedFiles.forEach(expectedFile => {
		assert(typeof expectedFile === 'object');
		assert(typeof expectedFile.path === 'string');
		assert(typeof expectedFile.content === 'string' || typeof expectedFile.content === 'boolean');

		if (expectedFile.content === false) {
			fs.access(expectedFile.path, err => {
				try{
					assert(err && err.code === 'ENOENT', `${expectedFile.path} shouldn't exist`);
				}
				catch(err){
					throw err;
				}
				finally{
					checkedCount++;poll();
				}
			});
		}
		else if (expectedFile.content === true) {
			isDirectory(expectedFile.path, (err, dir) => {
				try{
					if (err){throw err;}
					assert.equal(dir, true, `${expectedFile.path} should be a directory`);
				}
				catch(err){
					throw err;
				}
				finally{
					checkedCount++;poll();
				}
			});
		}
		else{
			fs.readFile(expectedFile.path, {encoding: 'utf-8'}, (err, fileContent) => {
				try{
					assert.equal(!err, true, `${expectedFile.path} wasn't created`);
					assert.equal(`${expectedFile.path} contains => ${fileContent}`, `${expectedFile.path} contains => ${expectedFile.content}`);
				}
				catch(err){
					throw err;
				}
				finally{
					checkedCount++;poll();
				}
			});
		}
	});
}