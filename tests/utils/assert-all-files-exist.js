'use strict';

const fs = require('fs');
const path = require('path');
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

		let expectedFilePath = expectedFile.path;

		if(expectedFile.relative === true){
			expectedFilePath = path.join(process.cwd(), expectedFilePath);
		}

		if (expectedFile.content === false) {
			fs.access(expectedFilePath, err => {
				try{
					assert(err && err.code === 'ENOENT', `${expectedFilePath} shouldn't exist`);
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
			isDirectory(expectedFilePath, (err, dir) => {
				try{
					if (err){throw err;}
					assert.equal(dir, true, `${expectedFilePath} should be a directory`);
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
			fs.readFile(expectedFilePath, {encoding: 'utf-8'}, (err, fileContent) => {
				try{
					assert.equal(!err, true, `${expectedFilePath} wasn't created`);
					assert.equal(`${expectedFilePath} contains => ${fileContent}`, `${expectedFilePath} contains => ${expectedFile.content}`);
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