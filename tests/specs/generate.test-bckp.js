'use strict';

const path = require('path');

const assert = require('assert');
const test = require('ava');

const dashify = require('dashify');

const requireFromIndex = require('../utils/require-from-index');
const createTestDirectory = require('../utils/create-test-directory');

const FileWriter = requireFromIndex('sources/file-writer');

test('type and api', t => {
	const generateFromIndex = requireFromIndex('index');
	const generate = requireFromIndex('sources/generate');

	assert(generateFromIndex === generate);
	assert(typeof generate === 'function');
});

test.cb('generate.write()', t => {
	const generate = requireFromIndex('sources/generate');

	assert(typeof generate.write === 'function');

	const fileWriter = generate.write('mock file content');

	assert(fileWriter instanceof FileWriter);

	t.plan(1);
	createTestDirectory({
		title: 'generate-write'
	}, directory => {
		fileWriter.writeTo(directory.join('expected-file.txt')).then(()=>{
			directory.assertAllFilesExist([{
				path: 'expected-file.txt',
				content: 'mock file content'
			}], ()=>{
				t.pass();
				t.end();
			});
		}).catch(err => {
			throw err;
			t.fail();
		});
	})
});

test.cb.skip('generate.copy()', t => {
	const generate = requireFromIndex('sources/generate');

	assert(typeof generate.copy === 'function');

	const fileWriter = generate.copy('');
});

/*--------------------------------------*/
/*--------------------------------------*/
/*--------------------------------------*/

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