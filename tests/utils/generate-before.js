'use strict';

const assert = require('assert');

const dashify = require('dashify');

const mockGenerateConfig = require('../mocks/mock-generate-config');

const createTestDirectory = require('../utils/create-test-directory');

function getExpectedFilesFromConfigSchema(configSchema){
	const expectedFiles = [];

	for(const filePath in configSchema){
		const entry = configSchema[filePath];

		expectedFiles.push({
			path: filePath,
			content: entry.content,
			from: entry.type
		});
	}

	return expectedFiles;
}

function generateBefore(t, {
	configSchema,
	expectError,
	assertAllFilesExist = []
}, coreTest) {

	assertAllFilesExist = [...assertAllFilesExist, {
		path: 'must-be-preserved.txt',
		content: 'must-be-preserved'
	}, ...getExpectedFilesFromConfigSchema(configSchema)];

	t.plan(1);

	createTestDirectory({
		title: dashify(t.title),
		template: 'must-be-preserved'
	}, destDirectory => {
		const prefixedConfigSchema = {};

		for(const filePath in configSchema){
			prefixedConfigSchema[destDirectory.join(filePath)] = configSchema[filePath];
		}

		mockGenerateConfig(prefixedConfigSchema, (generateConfig, configFileWriters) => {
			coreTest({
				generateConfig,
				expectedErrorMessage: expectError || null,
				assertAllFilesExist(callback){
					destDirectory.assertAllFilesExist(assertAllFilesExist.filter(f => f.from !== 'instance of FileWriter'), ()=>{

						configFileWriters.forEach(({writer, destinationPath}) => {
							assert.equal(writer.writeToCalledCount, 1);
							assert.equal(writer.writeToCalled.destinationPath, destinationPath);
							assert.equal(writer.writeToCalled.callback, null);
							assert.equal(writer.writeToCalled.fs, null);
							assert.equal(writer.writeToCalled.isDirectory, null);
							assert.equal(writer.writeToCalled.mkdirp, null);
							assert.equal(writer.writeToCalled.cwd, null);
						});

						callback();
					});
				}
			})
		});
	});
}

module.exports = generateBefore;