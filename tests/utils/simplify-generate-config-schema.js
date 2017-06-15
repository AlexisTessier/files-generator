'use strict';

const simpleFilePath = 'fp';
const deepFilePath = 'dfp';

const instanceOfFileWriter = 'fwi';
const contentAsString = 'sg';
const trueForDirectory = 'd';
const buffer = 'b';
const stream = 'sm';

/**
 * @description - provide a more readable and ava test titles compatible version of a generate config schema
 */
function simplifyGenerateConfigSchema(configSchema) {
	let count = 0;

	function i(s){
		return `${s}_${++count}`
	}

	const simplifiedSchema = {};

	for(const key in configSchema){
		const simplifiedKey = i(
			(key.match(/\//g) || []).length ? deepFilePath : simpleFilePath
		);

		const entry = configSchema[key];
		
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

			default:
				throw new Error(`simplifyGenerateConfigSchema: ${entry.type} is not handled`);
		}

		simplifiedSchema[simplifiedKey] = simplifiedType;
	}

	return simplifiedSchema;
}

module.exports = simplifyGenerateConfigSchema;