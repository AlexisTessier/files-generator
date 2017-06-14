'use strict';

const path = require('path');

const assert = require('assert');
const test = require('ava');

const permutations = require('js-combinatorics').power;
const randomstring = require("randomstring");
const dashify = require('dashify');
const intoStream = require('into-stream');

const requireFromIndex = require('../utils/require-from-index');
const createTestDirectory = require('../utils/create-test-directory');

const FileWriter = requireFromIndex('sources/file-writer');
const mockFileWriter = require('../')

test('type and api', t => {
	const generateFromIndex = requireFromIndex('index');
	const generate = requireFromIndex('sources/generate');

	assert(generateFromIndex === generate);
	assert(typeof generate === 'function');
});

test.skip('generate.write', t => {
	const generate = requireFromIndex('sources/generate');

	assert(typeof generate.write === 'function');

	const contentMock = mockFileContent();
	const fileWriter = generate.write(contentMock);
});

test.skip('generate.copy', t => {
	const generate = requireFromIndex('sources/generate');

	assert(typeof generate.copy === 'function');
});

function generatePromiseStyleMacro(t) {
	// body...
}
//generatePromiseStyleMacro.title = (providedTitle, info) => `${providedTitle} - promise style`

function generateCallbackStyleMacro(t) {
	// body...
}
//generateCallbackStyleMacro.title = (providedTitle, info) => `${providedTitle} - callback style`

const generatePromiseAndCallbackStyleMacro = [generatePromiseStyleMacro, generateCallbackStyleMacro];

const possibleGenerateConfigsTypes = [
	'generate config object',
	// 'array of valid generate config',
	// 'promise resolving a valid generate config',
	// 'function resolving a valid generate config'
];

const possibleGenerateConfigObjectKeyValuesTypes = [
	'instance of FileWriter',
	'content as string',
	'true for directory',
	'buffer',
	'stream',
	// 'valid generate config', //will nest the paths
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

function mockFileContent(){
	return `file-content-${randomstring.generate()}`;
}

function mockGenerateConfigObjectKeyValue(valueType, content) {
	if(valueType === 'content as string'){
		return content;
	}

	if(valueType === 'true for directory'){
		return true
	}

	if(valueType === 'buffer'){
		return Buffer.from(content)
	}

	if(valueType === 'stream'){
		return intoStream(content)
	}

	if (valueType === 'instance of FileWriter') {
		return new mockFileWriter()
	}

	throw new Error(`mockGenerateConfigObjectKeyValue: ${valueType} is not a test handled type`)
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

function createGenerateConfigObjectsSchemas() {
	const configObjects = [];
	possibleGenerateConfigObjectsSchemaKeyValuesTypes.forEach(possibility => {
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

function createGenerateTestWith(configType, configSchema) {
	const title = `${configType} which match the schema ${JSON.stringify(configSchema)}`;
	test.cb(title, t => {
		t.plan(1);

		createTestDirectory({
			title: dashify(title).substring(0, 200),
			template: 'must-be-preserved'
		}, directory => {
			const generate = requireFromIndex('sources/generate');
			
			getGenerateConfigFromConfigSchema(configSchema, directory, (config, fileWriters) => {
				const expectedFiles = getExpectedFilesFromConfigSchema(configSchema);

				const generatePromise = generate(config);

				assert(generatePromise instanceof Promise);

				generatePromise.then(()=>{
					directory.assertAllFilesExist(expectedFiles.filter(f => !f.fromFileWriter), ()=>{

						fileWriters.forEach(({writer, destinationPath}) => {
							assert.equal(writer.writeToCalledCount, 1);
							assert.equal(writer.writeToCalled.destinationPath, destinationPath);
							assert.equal(writer.writeToCalled.callback, null);
							assert.equal(writer.writeToCalled.fs, null);
							assert.equal(writer.writeToCalled.isDirectory, null);
							assert.equal(writer.writeToCalled.mkdirp, null);
							assert.equal(writer.writeToCalled.cwd, null);
						});

						t.pass();t.end();
					});
				});
			});
		});
	});

	test.cb(`${title} - callback style`, t => {
		t.plan(1);

		createTestDirectory({
			title: dashify(title).substring(0, 200)+' - callback style',
			template: 'must-be-preserved'
		}, directory => {
			const generate = requireFromIndex('sources/generate');
			
			getGenerateConfigFromConfigSchema(configSchema, directory, (config, fileWriters) => {
				const expectedFiles = getExpectedFilesFromConfigSchema(configSchema);

				const generateResult = generate(config, undefined, err => {
					assert(!err);

					directory.assertAllFilesExist(expectedFiles.filter(f => !f.fromFileWriter), ()=>{
						fileWriters.forEach(({writer, destinationPath}) => {
							assert.equal(writer.writeToCalledCount, 1);
							assert.equal(writer.writeToCalled.destinationPath, destinationPath);
							assert.equal(writer.writeToCalled.callback, null);
							assert.equal(writer.writeToCalled.fs, null);
							assert.equal(writer.writeToCalled.isDirectory, null);
							assert.equal(writer.writeToCalled.mkdirp, null);
							assert.equal(writer.writeToCalled.cwd, null);
						});

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

		expectedFiles.push({
			path: fullPath(filePath),
			content: entry.content,
			fromFileWriter: entry.type === 'instance of FileWriter'
		});
	}

	return expectedFiles;
}

function getGenerateConfigFromConfigSchema(configSchema, directory, configCallback) {
	const copy = {};
	const fileWriters = [];

	const toCheckCount = Object.keys(configSchema).length;
	let checkedCount = 0;

	function poll(){
		if (checkedCount >= toCheckCount) {
			configCallback(copy, fileWriters);
		}
	}

	poll();

	for(const filePath in configSchema){
		const entry = configSchema[filePath];
		const fullFilePath = directory ? directory.join(filePath) : filePath;

		copy[fullFilePath] = mockGenerateConfigObjectKeyValue(entry.type, entry.content);

		if (entry.type === 'instance of FileWriter') {
			fileWriters.push({
				writer: copy[fullFilePath],
				destinationPath: fullFilePath
			});
		}

		checkedCount++;poll();
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