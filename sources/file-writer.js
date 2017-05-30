'use strict';

const fs = require('fs');
const path = require('path');

const assert = require('better-assert');

const isStream = require('is-stream');

const writeContents = new WeakMap();
const copyContents = new WeakMap();

module.exports = class FileWriter{
	constructor({
		write = null,
		copy = null
	}){
		assert(write || copy);

		if (write) {
			assert(copy === null);
			assert(typeof write === 'string' || write instanceof Buffer || isStream(write) || write instanceof Promise);

			writeContents.set(this, write);
		}

		if (copy) {
			assert(write === null);
			assert(typeof copy === 'string' && path.isAbsolute(copy));

			copyContents.set(this, copy);
		}
	}

	writeTo(destinationPath, callback){
		assert(typeof destinationPath === 'string' && path.isAbsolute(destinationPath));

		const encoding = 'utf-8';

		if (writeContents.has(this)) {
			const content = writeContents.get(this);

			if (content instanceof Promise) {
				content.then(asyncContent => {
					const asyncWriter = new FileWriter({
						write: asyncContent
					});

					asyncWriter.writeTo(destinationPath, callback);
				});
			}
			else if (isStream(content)) {
				content.pipe(fs.createWriteStream(destinationPath, {
					encoding
				})).on('error', err => {
					callback(err);
				}).on('finish', ()=>{
					callback(null);
				});
			}
			else{
				fs.writeFile(destinationPath, content, {
					encoding
				}, err => {callback(err)});
			}
		}

		if (typeof callback !== 'function') {
			return new Promise(resolve => {
				callback = err => err ? reject(err) : resolve()
			});
		}
	}
}