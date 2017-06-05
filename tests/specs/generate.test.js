'use strict';

const assert = require('assert');
const test = require('ava');

const requireFromIndex = require('../utils/require-from-index');

const createTestDirectory = require('../utils/create-test-directory');

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

const validGenerateConfig = [
	'generate config object',
	'array of valid generate config',
	'promise resolving a valid generate config',
	'function resolving a valid generate config'
];

const validGenerateConfigObjectKeysValues = [
	'instance of FileWriter',
	'content as string',
	'buffer',
	'stream',
	'valid generate config', //will nest the paths,
	'content from generate.write',
	'content from generate.copy'
];

// validGenerateConfig.forEach(validConfigType => {
// 	mockConfig(validConfigType, validConfig => {

// 	});
// });


// const availableOptions = {
// 	override: [true, false],
// 	backupStrategy: [false, null, 'trash', 'backup-file', 'custom-strategy'],
// 	backupStrategyOptions: {},
// 	onFileWriten: null,
// 	rootPath: ''
// };

// test('generate from an instance of FileWriter', t => {
// 	const generate = requireFromIndex('sources/generate');
// 	const FileWriter = requireFromIndex('sources/file-writer');

// 	t.plan(1);
// 	return createMockDirectory('generate-from-instance-of-file-writer').then(directory => {
// 		const generatePromise = generate({
// 			[directory.join('file-from-file-writer.txt')]: new FileWriter({
// 				write: 'file-content-from-file-writer'
// 			})
// 		});

// 		assert(generatePromise instanceof Promise);

// 		return generatePromise.then(()=>{
// 			return directory.assertAllFilesExist([{
// 				path: 'file-from-file-writer.txt',
// 				content: 'file-content-from-file-writer'
// 			}]).then(()=>{t.pass()})
// 		});
// 	});
// });

// test.skip('generate from an instance of FileWriter - callback style', t => {
// });

// test.skip('generate from multiple instances of FileWriter', t => {
// });

// test.skip('generate from multiple instances of FileWriter - callback style', t => {
// });

// test.skip('generate from an empty object of instance of FileWriter', t => {
// });

// test.skip('generate from an empty object of instance of FileWriter - callback style', t => {
// });

// test.skip('generate from an Array of generate config', t => {
// });

// test.skip('generate from an Array of generate config - callback style', t => {
// });

// test.skip('generate from a string', t => {
// });

// test.skip('generate from a string - callback style', t => {
// });

// test.skip('generate from a buffer', t => {
// });

// test.skip('generate from a buffer - callback style', t => {
// });

// test.skip('generate from a stream', t => {
// });

// test.skip('generate from a stream - callback style', t => {
// });

// test.skip('generate nested files', t => {
// });

// test.skip('generate nested files - callback style', t => {
// });

// test.skip('generate from a Promise resolving an instance of FileWriter', t => {
// });

// test.skip('generate from a Promise resolving an instance of FileWriter - callback style', t => {
// });

// test.skip('generate from a function and resolving an instance of FileWriter', t => {
// });

// test.skip('generate from a function and an instance of FileWriter - callback style', t => {
// });