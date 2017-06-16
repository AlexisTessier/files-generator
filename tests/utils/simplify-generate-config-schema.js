'use strict';

const simpleFilePath = 'fp';
const deepFilePath = 'dfp';
const generateConfigObject = 'gco';

const instanceOfFileWriter = 'fwi';
const contentAsString = 'sg';
const trueForDirectory = 'd';
const buffer = 'b';
const stream = 'sm';
const generateWrite = 'gw';
const generateCopy = 'gc';
const nestedGenerateConfig = 'ngc';

/**
 * @description - provide a more readable and ava test titles compatible version of a generate config schema
 */
function simplifyGenerateConfigSchema(configSchema) {
	let count = 0;

	function i(s){
		return `${s}${++count}`
	}

	const simplifiedSchema = {};

	if (configSchema.type === 'generate config object') {
		simplifiedSchema[i(generateConfigObject)] = simplifyGenerateConfigSchema(configSchema.content);
		return simplifiedSchema;
	}

	for(const key in configSchema){
		const entry = configSchema[key];

		let simplifiedKey = i(
			(key.match(/\//g) || []).length ? deepFilePath : simpleFilePath
		);
		
		let simplifiedType = null;

		switch(entry.type){
			case 'instance of FileWriter':
				simplifiedType = i(instanceOfFileWriter);
				break;

			case 'content as string':
				simplifiedType = i(contentAsString);
				break;

			case 'true for directory':
				simplifiedType = i(trueForDirectory);
				break;

			case 'buffer':
				simplifiedType = i(buffer);
				break;

			case 'stream':
				simplifiedType = i(stream);
				break;

			case 'generate.write()':
				simplifiedType = i(generateWrite);
				break;

			case 'generate.copy()':
				simplifiedType = i(generateCopy);
				break;

			case 'valid generate config':
				simplifiedType = i(nestedGenerateConfig);
				break;

			default:
				throw new Error(`simplifyGenerateConfigSchema: ${entry.type} is not handled`);
		}

		simplifiedSchema[simplifiedKey] = simplifiedType;
	}

	return simplifiedSchema;
}

module.exports = simplifyGenerateConfigSchema;