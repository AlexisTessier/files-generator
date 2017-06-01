'use strict';

const defaultFS = require('fs');
const path = require('path');

const assert = require('better-assert');

const isStream = require('is-stream');

const writeContents = new WeakMap();
const copyContents = new WeakMap();

module.exports = class FileWriter{
	constructor({
		write = null,
		copy = null,
		encoding = 'utf-8'
	}){
		assert(write || copy);

		if (write) {
			assert(copy === null);
			assert(typeof write === 'string' || write instanceof Buffer || isStream(write) || write instanceof Promise || typeof write === 'function');

			writeContents.set(this, write);
		}

		if (copy) {
			assert(write === null);
			assert((typeof copy === 'string' && path.isAbsolute(copy)) || copy instanceof Promise || typeof copy === 'function');

			copyContents.set(this, copy);
		}

		this.encoding = encoding;
	}

	writeTo(destinationPath, callback, { // eslint-disable-line max-params
		fs = defaultFS
	} = {}){
		assert(typeof destinationPath === 'string' && path.isAbsolute(destinationPath));
		
		assert(typeof fs === 'object');
		assert(typeof fs.writeFile === 'function');
		assert(typeof fs.createReadStream === 'function');
		assert(typeof fs.createWriteStream === 'function');

		const options = {
			encoding: this.encoding
		};

		const injection = {fs};

		if (writeContents.has(this)) {
			const content = writeContents.get(this);

			if (content instanceof Promise) {
				content.then(asyncContent => {
					new FileWriter(Object.assign({
						write: asyncContent
					}, options)).writeTo(destinationPath, cb, injection);
				}).catch(err => {
					cb(new Error(`Error getting the content of "${destinationPath}" => ${err.message}`))
				});
			}
			else if (typeof content === 'function'){
				content((err, asyncContent)=>{
					if (err) {
						cb(new Error(`Error getting the content of "${destinationPath}" => ${err.message}`))
					}
					else{
						new FileWriter(Object.assign({
							write: asyncContent
						}, options)).writeTo(destinationPath, cb, injection);
					}
				})
			}
			else if (isStream(content)) {
				content.pipe(fs.createWriteStream(destinationPath, options)).on('error', cb).on('finish', cb);
			}
			else{
				fs.writeFile(destinationPath, content, options, cb);
			}
		}
		
		/* istanbul ignore else */
		if(copyContents.has(this)){
			const original = copyContents.get(this);

			if(original instanceof Promise){
				original.then(asyncOriginal => {
					new FileWriter(Object.assign({
						copy: asyncOriginal
					}, options)).writeTo(destinationPath, cb, injection);
				}).catch(err => {
					cb(new Error(`Error getting the original to copy to "${destinationPath}" => ${err.message}`))
				});
			}
			else if(typeof original === 'function'){
				original((err, asyncOriginal)=>{
					if (err) {
						cb(new Error(`Error getting the original to copy to "${destinationPath}" => ${err.message}`))
					}
					else{
						new FileWriter(Object.assign({
							copy: asyncOriginal
						}, options)).writeTo(destinationPath, cb, injection);
					}
				})
			}
			else{
				new FileWriter(Object.assign({
					write: fs.createReadStream(original, options)
				}, options)).writeTo(destinationPath, cb, injection);
			}
		}

		function cb(err) {
			process.nextTick(()=>{
				callback(err);
			});
		};

		if (typeof callback !== 'function') {
			return new Promise((resolve, reject) => {
				callback = err => err ? reject(err) : resolve()
			});
		}
	}
}