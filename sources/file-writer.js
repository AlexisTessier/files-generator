'use strict';

const defaultFS = require('fs');
const path = require('path');

const assert = require('better-assert');

const isStream = require('is-stream');
const defaultIsDirectory = require('is-directory');
const defaultMkdirp = require('mkdirp');
const copyDirectory = require('ncp').ncp;

const writeContents = new WeakMap();
const copyContents = new WeakMap();

/** @private */
module.exports = class FileWriter{
	constructor({
		write = null,
		copy = null,
		encoding = 'utf-8'
	}){
		assert(write || copy);

		if (write) {
			assert(copy === null);
			assert(write === true /* empty directory */ || typeof write === 'string' || write instanceof Buffer || isStream(write) || write instanceof Promise || typeof write === 'function');

			writeContents.set(this, write);
		}

		if (copy) {
			assert(write === null);
			assert((typeof copy === 'string' && path.isAbsolute(copy)) || copy instanceof Promise || typeof copy === 'function');

			copyContents.set(this, copy);
		}

		this.encoding = encoding;
	}

	writeTo(destinationPath, callback, {
		fs = defaultFS,
		isDirectory = defaultIsDirectory,
		mkdirp = defaultMkdirp
	} = {}){
		assert(typeof destinationPath === 'string' && path.isAbsolute(destinationPath));
		
		assert(typeof fs === 'object');
		assert(typeof fs.writeFile === 'function');
		assert(typeof fs.createReadStream === 'function');
		assert(typeof fs.createWriteStream === 'function');
		assert(typeof isDirectory === 'function');
		assert(typeof mkdirp === 'function');

		const options = {
			encoding: this.encoding
		};

		const injection = {
			fs,
			isDirectory,
			mkdirp
		};

		function createDirectory(dirToCreate = path.dirname(destinationPath)) {
			return new Promise((resolve, reject) => {
				mkdirp(dirToCreate, {fs}, err => {
					if (err) {reject(err); return;}
					resolve();
				});
			});
		}

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
				createDirectory().then(()=>{
					content.pipe(fs.createWriteStream(destinationPath, options)).on('error', cb).on('finish', cb);
				}).catch(cb);
			}
			else if (content === true /*empty directory*/){
				createDirectory(destinationPath).then(cb).catch(cb);
			}
			else{
				createDirectory().then(()=>{
					fs.writeFile(destinationPath, content, options, cb);
				}).catch(cb);
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
				isDirectory(original, (err, dir) => {
					if (err) {cb(err);return;}

					if(dir){
						createDirectory().then(()=>{
							copyDirectory(original, destinationPath, cb);
						}).catch(cb);
					}
					else{
						new FileWriter(Object.assign({
							write: fs.createReadStream(original, options)
						}, options)).writeTo(destinationPath, cb, injection);
					}
				});
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