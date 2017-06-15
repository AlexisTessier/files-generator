'use strict';

const path = require('path');

const assert = require('assert');
const test = require('ava');

const requireFromIndex = require('../utils/require-from-index');

const createGenerateConfigObjectsSchemas = require('../utils/create-generate-config-objects-schemas');
const simplifyGenerateConfigSchema = require('../utils/simplify-generate-config-schema');
const generateBefore = require('../utils/generate-before');

const FileWriter = requireFromIndex('sources/file-writer');

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
			generatePromise.then(()=>{t.fail();}).catch(err => {
				assert.equal(err.message, expectedErrorMessage);

				assertAllFilesExist(()=>{t.pass();t.end();});
			});
		}
		else{
			generatePromise.then(()=>{
				assertAllFilesExist(()=>{t.pass();t.end();})
			}).catch(err => {assert(!err, `${t.title} shouldn't throw error => ${err ? err.message : ''}`)});
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
				assert(!err, `${t.title} shouldn't throw error => ${err ? err.message : ''}`);
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
	'generate.write()',
	'generate.copy()'
	// 'valid generate config', //will nest the paths
];

createGenerateConfigObjectsSchemas(generateConfigObjectTypes, generateConfigObjectKeyValuesTypes).forEach(configSchema => {
	test.cb(generatePromiseAndCallbackStyleMacro, {
		configSchema
	});
});

test('generate.write() is a function', t => {
	const generate = requireFromIndex('sources/generate');

	assert(typeof generate.write === 'function');

	const writer = generate.write('file-content');

	assert(writer instanceof FileWriter);
});

test('generate.copy() is a function', t => {
	const generate = requireFromIndex('sources/generate');

	assert(typeof generate.copy === 'function');

	const writer = generate.copy('file-content');

	assert(writer instanceof FileWriter);
});

test.todo('generate options')

// const availableOptions = {
// 	override: [true, false],
// 	backupStrategy: [false, null, 'trash', 'backup-file', 'custom-strategy'],
// 	backupStrategyOptions: {},
// 	onFileWriten: null,
// 	rootPath: ''
// };
