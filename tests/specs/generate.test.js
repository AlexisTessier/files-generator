'use strict';

const path = require('path');

const assert = require('assert');
const test = require('ava');

const requireFromIndex = require('../utils/require-from-index');

const createTestDirectory = require('../utils/create-test-directory');

const permutations = require('js-combinatorics').power;
const randomstring = require("randomstring");
const dashify = require('dashify');

test('type and api', t => {
	const generateFromIndex = requireFromIndex('index');
	const generate = requireFromIndex('sources/generate');

	assert(generateFromIndex === generate);
	assert(typeof generate === 'function');
});

test.skip('generate.write and generate.copy', t => {
	const generate = requireFromIndex('sources/generate');

	assert(typeof generate.write === 'function');
	assert(typeof generate.copy === 'function');
});

const possibleGenerateConfigsTypes = [
	'generate config object',
	// 'array of valid generate config',
	// 'promise resolving a valid generate config',
	// 'function resolving a valid generate config'
];

const possibleGenerateConfigObjectKeyValuesTypes = [
	// 'instance of FileWriter',
	'content as string',
	// 'true for directory',
	// 'buffer',
	// 'stream',
	// 'valid generate config', //will nest the paths,
	// 'content from generate.write',
	// 'content from generate.copy'
];

/*--------------------------------------*/
/*--------------------------------------*/
/*--------------------------------------*/

const possibleGenerateConfigObjectsSchemaKeyValuesTypes = [
	[],
	...permutations(possibleGenerateConfigObjectKeyValuesTypes).toArray(),
	possibleGenerateConfigObjectKeyValuesTypes,
	[...possibleGenerateConfigObjectKeyValuesTypes, ...possibleGenerateConfigObjectKeyValuesTypes]
];

/*--------------------------------------*/
/*--------------------------------------*/
/*--------------------------------------*/

let fileNameCount = 0;
function mockGenerateConfigObjectKeyName(){
	fileNameCount++;

	if (fileNameCount % 3 === 0) {
		return `mock-folder-name-${fileNameCount}/mock-subfolder-name-${fileNameCount}/mock-file-name-${fileNameCount}.txt`;
	}

	if (fileNameCount % 2 === 0) {
		return `mock-folder-name-${fileNameCount}/mock-file-name-${fileNameCount}.txt`;
	}
	
	return `mock-file-name-${fileNameCount}.txt`;
}

function mockGenerateConfigObjectKeyValue(valueType) {
	if(valueType === 'content as string'){
		return `file-content-${randomstring.generate()}`
	}

	throw new Error(`${valueType} is not a test handled type`);
}

function createGenerateConfigObjectsKeyValueSchema(valueType) {
	if(valueType === 'content as string'){
		return mockGenerateConfigObjectKeyValue(valueType);
	}

	throw new Error(`${valueType} is not a test handled type`);
}

function createGenerateConfigObjectsSchemas() {
	const configObjects = [];
	possibleGenerateConfigObjectsSchemaKeyValuesTypes.forEach(possibility => {
		const conf = {};

		possibility.forEach(keyValue => {
			conf[mockGenerateConfigObjectKeyName()] = {
				type: keyValue,
				content: createGenerateConfigObjectsKeyValueSchema(keyValue)
			}
		});

		configObjects.push(conf)
	})

	return configObjects;
}

possibleGenerateConfigsTypes.forEach(possibility => {
	switch(possibility){
		case 'generate config object':
			createGenerateConfigObjectsSchemas().forEach(configSchema=>{
				createGenerateTestWith(possibility, configSchema)
			});
		break;

		default:
			throw new Error(`${possibility} is not a test handled possibleGenerateConfigObject`);
		break;
	}
});

function createGenerateTestWith(configType, configSchema) {
	const title = `generate with a ${configType} which match the schema ${JSON.stringify(configSchema)}`;
	test.cb(title, t => {
		t.plan(1);

		const expectedFiles = getExpectedFilesFromConfigSchema(configSchema);
		createTestDirectory({
			title: dashify(title).substring(0, 200),
			template: 'must-be-preserved'
		}, directory => {
			const generate = requireFromIndex('sources/generate');
			
			getGenerateConfigFromConfigSchema(configSchema, directory, config => {
				const generatePromise = generate(config);

				assert(generatePromise instanceof Promise);

				generatePromise.then(()=>{
					directory.assertAllFilesExist(expectedFiles, ()=>{
						t.pass();t.end();
					});
				}).catch(err => {t.fail();t.end()});
			});
		});
	});

	test.cb(`${title} - callback style`, t => {
		t.plan(1);

		const expectedFiles = getExpectedFilesFromConfigSchema(configSchema);
		createTestDirectory({
			title: dashify(title).substring(0, 200)+' - callback style',
			template: 'must-be-preserved'
		}, directory => {
			const generate = requireFromIndex('sources/generate');
			
			getGenerateConfigFromConfigSchema(configSchema, directory, config => {
				const generateResult = generate(config, undefined, err=>{
					assert(!err);

					directory.assertAllFilesExist(expectedFiles, ()=>{
						t.pass();t.end();
					});
				});

				assert.equal(generateResult, null);
			});
		});
	});
}

function getExpectedFilesFromConfigSchema(configSchema, baseFilePath = null){
	const expectedFiles = baseFilePath ? [] : [{
		path: 'must-be-preserved.txt',
		content: 'must-be-preserved'
	}];

	function fullPath(...paths) {
		return baseFilePath ? path.join(baseFilePath, ...paths) : path.join(...paths);
	}

	for(const filePath in configSchema){
		const entry = configSchema[filePath];

		switch(entry.type){
			case 'content as string':
				expectedFiles.push({
					path: fullPath(filePath),
					content: entry.content
				});
			break;
			
			default:
				throw new Error(`${entry.type} is not a test handled type`);
			break;
		}
	}

	return expectedFiles;
}

function getGenerateConfigFromConfigSchema(configSchema, directory, configCallback) {
	const copy = {};

	const toCheckCount = Object.keys(configSchema).length;
	let checkedCount = 0;

	function poll(){
		if (checkedCount >= toCheckCount) {
			configCallback(copy);
		}
	}

	poll();

	for(const filePath in configSchema){
		const entry = configSchema[filePath];
		const fullFilePath = directory ? directory.join(filePath) : filePath;

		switch(entry.type){
			case 'content as string':
				copy[fullFilePath] = entry.content;
				checkedCount++;poll();
			break;
			
			default:
				throw new Error(`${entry.type} is not a test handled type`);
			break;
		}
	}
}

test.todo('generate options')

// const availableOptions = {
// 	override: [true, false],
// 	backupStrategy: [false, null, 'trash', 'backup-file', 'custom-strategy'],
// 	backupStrategyOptions: {},
// 	onFileWriten: null,
// 	rootPath: ''
// };