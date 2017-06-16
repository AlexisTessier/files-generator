'use strict';

const permutations = require('js-combinatorics').power;

const mockGenerateConfigObjectKeyName = require('../mocks/mock-generate-config-object-key-name');
const mockFileContent = require('../mocks/mock-file-content');

const maxDepth = 3;

function createGenerateConfigObjectsSchemas(configType, keyValuesTypes, depth = 0) {
	const configObjects = [];
	
	const keyValuesTypesPermutations = depth === 0 ? [
		[],
		...permutations(keyValuesTypes).toArray(),
		keyValuesTypes,
		[...keyValuesTypes, ...keyValuesTypes]
	] : [keyValuesTypes];

	keyValuesTypesPermutations.forEach(possibility => {
		const conf = {};

		possibility.forEach(type => {
			if (type === 'valid generate config') {
				if (depth < maxDepth) {
					conf[mockGenerateConfigObjectKeyName('directory')] = {
						type,
						content: createGenerateConfigObjectsSchemas(
							configType,
							keyValuesTypes,
							depth+1
						)[0]
					}
				}
			}
			else{
				conf[mockGenerateConfigObjectKeyName(type === 'true for directory' ? 'directory' : false)] = {
					type,
					content: type === 'true for directory' ? true : mockFileContent()
				}
			}
		});

		configObjects.push(conf);
	})

	return configObjects;
}

module.exports = createGenerateConfigObjectsSchemas;