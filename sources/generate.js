'use strict';

const fs = require('fs');
const path = require('path');

const assert = require('better-assert');
const mkdirp = require('mkdirp');

const listenableEvents = [
	'write', 'finish', 'error'
];

const defaultWriteFile = function writeFile(filePath, content, options, writeFileCallback) {
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

const defaultEncoding = 'utf-8';

class UseObject {
	constructor(content, options){
		Object.assign(this, {content, options})
	}
}

function generate({
	writeFile = defaultWriteFile,
	encoding = defaultEncoding
} = {}) {
	const _writeFile = writeFile, _encoding = encoding;

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

	function use(content, options) {
		return new UseObject(content, options);
	}

	function generateInstance(generateConfig, {
		writeFile = _writeFile,
		encoding = _encoding
	} = {}){
		assert(typeof generateConfig === 'object' || !generateConfig);

		process.nextTick(()=>{
			if (!generateConfig) {
				return emit('finish');
			}

			Promise.all(Object.keys(generateConfig).map(filePath => ({
				path: filePath,
				content: generateConfig[filePath]
			})).map(file => new Promise((resolve, reject) => {

				const fileContent = file.content;
				const writeFilehandler = err => {
					err ? reject(err) : resolve();
				};
				const writeFileOptions = {encoding};

				if (fileContent instanceof UseObject) {
					const fileContentOptions = fileContent.options || {};
					const writeFileOption = fileContentOptions.writeFile || writeFile;

					delete fileContentOptions.writeFile;

					writeFileOption(file.path, fileContent.content,
						Object.assign({}, writeFileOptions, fileContentOptions), 
						writeFilehandler
					);
				}
				else if(typeof fileContent === 'string'){
					writeFile(file.path, fileContent, writeFileOptions, writeFilehandler);
				}
			}))).then(()=>{
				emit('finish');
			});
		});
	}

	return Object.assign(generateInstance, {
		on, off, use, listenableEvents
	});
}

module.exports = generate;