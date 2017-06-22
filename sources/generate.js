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

function generate({
	writeFile = defaultWriteFile
} = {}) {
	const listeners = [];

	function emit(eventToEmit, ...args) {
		listeners.filter(({event}) => event === eventToEmit).forEach(({listener})=>listener(...args))
	}

	function on(event, listener) {
		listeners.push({event, listener});
	};

	function off() {
	};

	function generateInstance(generateConfig){
		assert(typeof generateConfig === 'object' || !generateConfig);

		process.nextTick(()=>{
			if (!generateConfig) {
				return emit('finish');
			}

			Promise.all(Object.keys(generateConfig).map(filePath => ({
				path: filePath,
				content: generateConfig[filePath]
			})).map(file => new Promise((resolve, reject) => {
				writeFile(file.path, file.content, {encoding: 'utf-8'}, err => {
					err ? reject(err) : resolve();
				});
			}))).then(()=>{
				emit('finish');
			});
		});
	}

	return Object.assign(generateInstance, {
		on, off, listenableEvents
	});
}

module.exports = generate;