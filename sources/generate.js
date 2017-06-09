'use strict';

const assert = require('better-assert');

const FileWriter = require('./file-writer');
const isStream = require('is-stream');

function generate(generateConfig, {
} = {}, callback) {
	assert(typeof generateConfig === 'object');

	const configKeys = Object.keys(generateConfig);
	const options = {};

	new Promise((resolve, reject) => {
		if (configKeys.length === 0) {
			resolve();
		}
		else{
			Promise.all(configKeys.map(destinationPath => {
				const content = generateConfig[destinationPath];

				if (content instanceof FileWriter) {
					let writeToPromise = null;
					let _err = null;

					try{
						writeToPromise = content.writeTo(destinationPath);
					}
					catch(err){
						_err = err;
						reject(err);
					}

					if (writeToPromise && !_err) {
						return writeToPromise;
					}
				}
				else if (
					typeof content === 'string' ||
					content instanceof Buffer ||
					isStream(content) ||
					content === true
				) {
					return generate({
						[destinationPath]: generateWrite(content)
					}, options);
				}
				else{
					reject(new Error(`${content} (${typeof content}) is not a valid file content.`));
				}
			})).then(()=>resolve()).catch(err => reject(err));
		}
	}).then(()=>{
		cb(null)
	}).catch(err=>{
		cb(err)
	});

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

function generateWrite(content) {
	return new FileWriter({ write: content });
}

function generateCopy(pathToCopy) {
	return new FileWriter({ copy: pathToCopy });
}

generate.write = generateWrite;
generate.copy = generateCopy;

module.exports = generate;