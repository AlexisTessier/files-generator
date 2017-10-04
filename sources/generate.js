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
 * @description - Create a generate function using the defined options
 *
 * @param {object} [options=] - An object containing the generate function options.
 * @param {function} [options.writeFile=] - The function which will be used to create files and/or directories.
 * @param {string} [options.encoding='utf-8'] - The encoding to use when writing files.
 * @param {string} [options.cwd=process.cwd()] - The cwd used if you try to generate some relative paths. Must be an absolute path.
 */
function generateGenerate({
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

	/**
	 * @description - Generate files from different kinds of inputs
	 * 
	 * @param {GenerateConfig} generateConfig - The generate config contains all the file paths to generate.
	 * @param {object} options - This options object can be used to overide some options defined in the generateGenerate function.
	 */
	function generate(generateConfig, {
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

	return Object.assign(generate, {
		on, off, use, listenableEvents
	});
}

module.exports = generateGenerate;