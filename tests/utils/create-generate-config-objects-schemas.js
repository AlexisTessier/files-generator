'use strict';

const permutations = require('js-combinatorics').power;

const mockGenerateConfigObjectKeyName = require('../mocks/mock-generate-config-object-key-name');
const mockFileContent = require('../mocks/mock-file-content');

function createGenerateConfigObjectsSchemas(configType, keyValuesTypes) {
	const configObjects = [];
	
	const keyValuesTypesPermutations = [
		[],
		...permutations(keyValuesTypes).toArray(),
		keyValuesTypes,
		[...keyValuesTypes, ...keyValuesTypes]
	];

	keyValuesTypesPermutations.forEach(possibility => {
		const conf = {};

		possibility.forEach(type => {
			conf[mockGenerateConfigObjectKeyName()] = {
				type,
				content: type === 'true for directory' ? true : mockFileContent()
			}
		});

		configObjects.push(conf);
	})

	return configObjects;
}

module.exports = createGenerateConfigObjectsSchemas;