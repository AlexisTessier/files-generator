'use strict';

const path = require('path');

const assert = require('assert');
const test = require('ava');

const requireFromIndex = require('../utils/require-from-index');
const createGenerateConfigObjectsSchemas = require('../utils/create-generate-config-objects-schemas');
const simplifyGenerateConfigSchema = require('../utils/simplify-generate-config-schema');

test('type and api', t => {
	const generateFromIndex = requireFromIndex('index');
	const generate = requireFromIndex('sources/generate');

	assert(generateFromIndex === generate);
	assert(typeof generate === 'function');
});

function generatePromiseStyleMacro(t, testVariant) {
	generateBefore(t, testVariant, ({
		generateConfig,
		expectedErrorMessage,
		assertAllFilesExist
	}) => {
		const generate = requireFromIndex('sources/generate');

		const generatePromise = generate(generateConfig);

		assert(generatePromise instanceof Promise);

		if(expectedErrorMessage){
			writeToPromise.then(()=>{t.fail();}).catch(err => {
				assert.equal(err.message, expectedErrorMessage);

				assertAllFilesExist(()=>{t.pass();t.end();});
			});
		}
		else{
			writeToPromise.then(()=>{
				assertAllFilesExist(()=>{t.pass();t.end();})
			}).catch(err => {assert.equal(!!err, false, `${t.title} shouldn't throw error`)});
		}
	});
}
generatePromiseStyleMacro.title = (providedTitle, {configSchema}) => (
	`${providedTitle} - generate with a config matching the schema ${JSON.stringify(simplifyGenerateConfigSchema(configSchema))} - promise style`
);

function generateCallbackStyleMacro(t, testVariant) {
	generateBefore(t, testVariant, ({
		generateConfig,
		expectedErrorMessage,
		assertAllFilesExist
	}) => {
		const generate = requireFromIndex('sources/generate');

		const generateResult = generate(generateConfig, err => {
			if(expectedErrorMessage){
				assert.equal(err.message, expectedErrorMessage);
			}
			else{
				assert(!err, `${t.title} shouldn't throw error`);
			}

			assertAllFilesExist(()=>{t.pass();t.end()});
		});

		assert.equal(generateResult, null);
	});	
}
generateCallbackStyleMacro.title = (providedTitle, {configSchema}) => (
	`${providedTitle} - generate with a config matching the schema ${JSON.stringify(simplifyGenerateConfigSchema(configSchema))} - callback style`
);

const generatePromiseAndCallbackStyleMacro = [generatePromiseStyleMacro, generateCallbackStyleMacro];

/*--------------------------------------*/
/*--------------------------------------*/
/*--------------------------------------*/

const generateConfigObjectTypes = [
	'generate config object',
	// 'array of valid generate config',
	// 'promise resolving a valid generate config',
	// 'function resolving a valid generate config'
];

const generateConfigObjectKeyValuesTypes = [
	'instance of FileWriter',
	'content as string',
	'true for directory',
	'buffer',
	'stream',
	// 'valid generate config', //will nest the paths
];

createGenerateConfigObjectsSchemas(generateConfigObjectTypes, generateConfigObjectKeyValuesTypes).forEach(configSchema => {
	test.cb(generatePromiseAndCallbackStyleMacro, {
		configSchema
	});
});
