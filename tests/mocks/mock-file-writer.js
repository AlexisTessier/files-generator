'use strict';

const requireFromIndex = require('../utils/require-from-index');

const FileWriter = requireFromIndex('sources/file-writer');

class mockFileWriter extends FileWriter{
	constructor({
		write = null,
		copy = null,
		encoding = null
	} = {}){
		super({
			write: 'write'
		});

		this.constructorCallCount = this.constructorCallCount ? this.constructorCallCount+1 : 1;
		this.constructorCalled = {
			write, copy, encoding
		};
	}

	writeTo(destinationPath = null, callback = null, {
		fs = null,
		isDirectory = null,
		mkdirp = null,
		cwd = null
	} = {}){
		this.writeToCalledCount = this.writeToCalledCount ? this.writeToCalledCount+1 : 1;
		this.writeToCalled = {
			destinationPath, callback, fs, isDirectory, mkdirp, cwd
		};

		if(callback){
			callback();
		}
		else{
			return Promise.resolve();
		}
	}
}

module.exports = mockFileWriter;