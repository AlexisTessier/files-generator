'use strict';

const fs = require('fs');
const path = require('path');
const assert = require('better-assert');
const nativeAssert = require('assert');

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
		assert(path.isAbsolute(expectedFile.path));

		assert(typeof expectedFile.content === 'string' || typeof expectedFile.content === 'boolean');

		const expectedFilePath = expectedFile.path;

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
					nativeAssert.equal(dir, true, `${expectedFilePath} should be a directory`);
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
					nativeAssert.equal(!err, true, `${expectedFilePath} should exist`);
					nativeAssert.equal(`${expectedFilePath} contains => ${fileContent}`, `${expectedFilePath} contains => ${expectedFile.content}`);
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