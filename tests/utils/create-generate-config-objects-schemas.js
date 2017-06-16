'use strict';

const permutations = require('js-combinatorics').power;

const mockGenerateConfigObjectKeyName = require('../mocks/mock-generate-config-object-key-name');
const mockFileContent = require('../mocks/mock-file-content');

const maxDepth = 3;

function createGenerateConfigObjectsSchemas(configTypes, keyValuesTypes, depth = 0) {
	const configObjects = [];
	
	const keyValuesTypesPermutations = depth === 0 ? [
		[],
		...permutations(keyValuesTypes).toArray(),
		keyValuesTypes,
		[...keyValuesTypes, ...keyValuesTypes]
	] : [keyValuesTypes];


	configTypes.forEach(configType => {
		switch(configType){
			case 'generate config object':
				keyValuesTypesPermutations.forEach(permutation => {
					const conf = {};

					permutation.forEach(type => {
						if (type === 'valid generate config') {
							if (depth < maxDepth) {
								conf[mockGenerateConfigObjectKeyName('directory')] = {
									type,
									content: createGenerateConfigObjectsSchemas(
										configTypes,
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
					
					configObjects.push({
						type: configType,
						content: conf
					});
				});
				break;

			// case 'array of valid generate config':

			// 	break;

			default:
				throw new Error(`createGenerateConfigObjectsSchemas: ${configType} is not a handled type`);
		}
	});

	

	return configObjects;
}

module.exports = createGenerateConfigObjectsSchemas;