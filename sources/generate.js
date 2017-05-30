'use strict';

const assert = require('better-assert');

const FileWriter = require('./file-writer');

function generate(generateConfig, callback) {
	assert(typeof generateConfig === 'object');

	const configKeys = Object.keys(generateConfig);

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
			})).then(()=>resolve()).catch(err => reject(err));
		}
	}).then(()=>{
		callback(null)
	}).catch(err=>{
		callback(err)
	});

	if (typeof callback !== 'function') {
		return new Promise(resolve => {
			callback = err => err ? reject(err) : resolve()
		});
	}
}

module.exports = generate;