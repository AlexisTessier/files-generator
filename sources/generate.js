'use strict';

const path = require('path');
const assert = require('better-assert');

const isStream = require('is-stream');

const FileWriter = require('./file-writer');

function generate(generateConfig, {
	parentDestinationPath
} = {}, callback) {
	assert(typeof generateConfig === 'object');
	assert(typeof parentDestinationPath === 'string' || !parentDestinationPath);

	const configKeys = Object.keys(generateConfig);
	const options = {
	};

	(configKeys.length === 0 ? Promise.resolve() : (
		Promise.all(configKeys.map(destinationPath => {
			const fullDestinationPath = parentDestinationPath ? path.join(parentDestinationPath, destinationPath) : destinationPath;

			const content = generateConfig[destinationPath];

			if (content instanceof FileWriter) {
				let writeToPromise = null;
				let _err = null;

				try{
					writeToPromise = content.writeTo(fullDestinationPath);
				}
				catch(err){
					_err = err;
				}

				return _err ? Promise.reject(_err) : writeToPromise;
			}
			else if (
				typeof content === 'string' ||
				content instanceof Buffer ||
				isStream(content) ||
				content === true
			) {
				return generate({
					[fullDestinationPath]: generateWrite(content)
				}, options);
			}
			else if(typeof content === 'object') {
				return generate(content, Object.assign({}, options, {
					parentDestinationPath: fullDestinationPath
				}));
			}
			else{
				return Promise.reject(new Error(`${content} (${typeof content}) is not a valid file content.`));
			}
		}))
	)).then(()=>cb()).catch(err=>cb(err));

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