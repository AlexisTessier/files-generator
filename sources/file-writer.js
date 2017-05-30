'use strict';

const fs = require('fs');
const path = require('path');

const assert = require('better-assert');

const writeContents = new WeakMap();
const copyContents = new WeakMap();

module.exports = class FileWriter{
	constructor({
		write = null,
		copy = null
	}){
		assert(
			(typeof write === 'string' && copy === null) ||
			(typeof copy === 'string' && write === null)
		);

		if (write) {
			writeContents.set(this, write);
		}
		else{
			copyContents.set(this, copy);
		}
		
	}

	writeTo(destinationPath, callback){
		assert(typeof destinationPath === 'string' && path.isAbsolute(destinationPath));

		if (writeContents.has(this)) {
			fs.writeFile(destinationPath, writeContents.get(this), {
				encoding: 'utf-8'
			}, err => {callback(err)});
		}

		if (typeof callback !== 'function') {
			return new Promise(resolve => {
				callback = err => err ? reject(err) : resolve()
			});
		}
	}


}