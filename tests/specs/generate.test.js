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

		const generateResult = generate(generateConfig, {}, err => {
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
	// 'array of generate config object',
	// 'array of promise resolving a generate config object',
	// 'array of function resolving a generate config object',
	// 'mixed array of valid generate config',

	// 'promise resolving a generate config object',
	// 'promise resolving an array of generate config object',
	// 'promise resolving a promise resolving a generate config object',
	// 'promise resolving a function resolving a generate config object',

	// 'function resolving a generate config object'
	// 'function resolving an array of generate config object',
	// 'function resolving a function resolving a generate config object'
	// 'function resolving a promise resolving a generate config object'
];

const generateConfigObjectKeyValuesTypes = [
	'instance of FileWriter',
	//'promise resolving an instance of FileWriter',
	//'promise resolving a promise resolving an instance of FileWriter',
	//'promise resolving a function resolving an instance of FileWriter',
	//'function resolving an instance of FileWriter'
	//'function resolving a function resolving an instance of FileWriter'
	//'function resolving a promise resolving an instance of FileWriter'
	'content as string',
	//'promise resolving a content as string',
	//'promise resolving a promise resolving a content as string',
	//'promise resolving a function resolving a content as string',
	//'function resolving a content as string'
	//'function resolving a function resolving a content as string'
	//'function resolving a promise resolving a content as string'
	'true for directory',
	//'promise resolving true for directory',
	//'promise resolving a promise resolving true for directory',
	//'promise resolving a function resolving true for directory',
	//'function resolving true for directory'
	//'function resolving a function resolving true for directory'
	//'function resolving a promise resolving true for directory'
	'buffer',
	//'promise resolving a buffer',
	//'promise resolving a promise resolving a buffer',
	//'promise resolving a function resolving a buffer',
	//'function resolving a buffer'
	//'function resolving a function resolving a buffer'
	//'function resolving a promise resolving a buffer'
	'stream',
	//'promise resolving a stream',
	//'promise resolving a promise resolving a stream',
	//'promise resolving a function resolving a stream',
	//'function resolving a stream'
	//'function resolving a function resolving a stream'
	//'function resolving a promise resolving a stream'
	'generate.write()',
	//'promise resolving generate.write()',
	//'promise resolving a promise resolving generate.write()',
	//'promise resolving a function resolving generate.write()',
	//'function resolving generate.write()'
	//'function resolving a function resolving generate.write()'
	//'function resolving a promise resolving generate.write()'
	'generate.copy()',
	//'promise resolving generate.copy()',
	//'promise resolving a promise resolving generate.copy()',
	//'promise resolving a function resolving generate.copy()',
	//'function resolving generate.copy()'
	//'function resolving a function resolving generate.copy()'
	//'function resolving a promise resolving generate.copy()'
	
	//will nest the paths
	//...generateConfigObjectTypes
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

test.todo('generate options');

// const availableOptions = {
// 	override: [true, false, Error],
// 	backupStrategy: [false, null, 'trash', 'backup-file', function customStrategy(){}],
// 	backupStrategyOptions: {},
// 	onFileWriten: null,
// 	rootPath: ''
// };
