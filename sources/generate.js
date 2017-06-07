'use strict';

const assert = require('better-assert');

const FileWriter = require('./file-writer');

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
					return content.writeTo(destinationPath);
				}
				else if (typeof content === 'string') {
					return generate({
						[destinationPath]: generateWrite(content)
					}, options);
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
		return new Promise(resolve => {
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