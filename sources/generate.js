'use strict';

const fs = require('fs');
const path = require('path');

const assert = require('better-assert');
const mkdirp = require('mkdirp');

/*----------------*/
/*----------------*/
/*----------------*/

/**
 * @private
 */
const listenableEvents = [
	'write', 'finish', 'error'
];

/**
 * @private
 */
function defaultWriteFile(filePath, content, options, writeFileCallback) {
	assert(typeof filePath === 'string' && path.isAbsolute(filePath));
	assert(typeof content === 'string');
	assert(typeof options === 'object');
	assert(typeof options.encoding === 'string');
	assert(typeof writeFileCallback === 'function');

	mkdirp(path.dirname(filePath), err => {
		if (err) {return writeFileCallback(err);}

		fs.writeFile(filePath, content, options, writeFileCallback);
	});
}

/**
 * @private
 */
const defaultEncoding = 'utf-8';

/**
 * @private
 */
class UseObject {
	constructor(content, options){
		Object.assign(this, {content, options})
	}
}

/**
 * @private
 */
function relativeToAbsolute(cwd, relative) {
	assert(path.isAbsolute(cwd));

	return path.isAbsolute(relative) ? relative : path.join(cwd, relative);
}

/**
 * @private
 */
function relativeCwdError(cwd) {
	return new Error(`You must provide an absolute cwd path. "${cwd}" is a relative one.`);
}

/*----------------*/
/*----------------*/
/*----------------*/

/**
 * @description - Generate files from different kinds of sources
 */
function generate({
	writeFile = defaultWriteFile,
	encoding = defaultEncoding,
	cwd = process.cwd()
} = {}) {
	if(!path.isAbsolute(cwd)){
		throw relativeCwdError(cwd);
	}

	const _writeFile = writeFile, _encoding = encoding, _cwd = cwd;

	let listeners = [];

	function emit(eventToEmit, ...args) {
		listeners.filter(({event}) => event === eventToEmit).forEach(({listener})=>listener(...args))
	}

	function on(event, listener) {
		listeners.push({event, listener});
	}

	function off(eventToUnbind, listenerToUnbind) {
		listeners = listeners.filter(({event, listener}) => {
			if (event === eventToUnbind) {
				return !(listener === listenerToUnbind);
			}

			return true;
		})
	}

	function use(content, options = {}) {
		if(options.cwd && !path.isAbsolute(options.cwd)){
			throw relativeCwdError(options.cwd);
		}

		return new UseObject(content, options);
	}

	function generateInstance(generateConfig, {
		writeFile = _writeFile,
		encoding = _encoding,
		cwd = _cwd
	} = {}){
		assert(typeof generateConfig === 'object' || !generateConfig);

		if(!path.isAbsolute(cwd)){
			throw relativeCwdError(cwd);
		}

		process.nextTick(()=>{
			if (!generateConfig) {
				return emit('finish');
			}

			Promise.all(Object.keys(generateConfig).map(filePath => ({
				path: filePath,
				content: generateConfig[filePath]
			})).map(file => new Promise((resolve, reject) => {

				const fileContent = file.content;
				function writeFilehandler(err){
					err ? reject(err) : resolve();
				}

				const filePathOptions = {
					encoding,
					writeFile,
					cwd
				};

				if (fileContent instanceof UseObject) {
					const fileContentOptions = fileContent.options || {};
					const filePathWriteFile = (fileContentOptions.writeFile || writeFile);
					const filePathCwd = (fileContentOptions.cwd || cwd);

					filePathWriteFile(relativeToAbsolute(filePathCwd, file.path), fileContent.content,
						Object.assign({}, filePathOptions, fileContentOptions), 
						writeFilehandler
					);
				}
				else if(typeof fileContent === 'string'){
					writeFile(relativeToAbsolute(cwd, file.path), fileContent, filePathOptions, writeFilehandler);
				}
			}))).then(() => {
				emit('finish');
			}).catch(err => {
				emit('error', err);
			});
		});
	}

	return Object.assign(generateInstance, {
		on, off, use, listenableEvents
	});
}

module.exports = generate;