'use strict';

const assert = require('assert');

const dashify = require('dashify');

const createTestDirectory = require('../utils/create-test-directory');

const mockFileWriterOptionsObject = require('../mocks/mock-file-writer-options-object');

module.exports = function writeToBefore(t, {
	write = undefined,
	copy = undefined,
	writeToPath = undefined,
	writeToRelativePath = undefined,
	writeToDependencies,
	expectError,
	expectFileWasCreated = undefined,
	assertAllFilesExist = [],
	copyOriginalPath = null,
	expectedFileContent = null
}, coreTest) {
	assert((write || copy) && (!!write !== !!copy));

	const types = (write || copy).split(' ');
	const lastType = types[types.length - 1];

	assertAllFilesExist = [...assertAllFilesExist, {
		path: 'must-be-preserved.txt',
		content: 'must-be-preserved'
	}];

	const relative = !!writeToRelativePath;

	writeToPath = writeToPath || writeToRelativePath || `${dashify(t.title)}${lastType === 'directory' ? '' : '.txt'}`
	const stringContent = expectedFileContent || `${dashify(t.title)} file content`;
	const custom_cwd = writeToDependencies ? (writeToDependencies.cwd || false) : false;

	if (expectFileWasCreated !== undefined) {
		assertAllFilesExist.push({
			path: writeToPath,
			content: expectFileWasCreated ? (lastType === 'directory' ? true : stringContent) : false,
			relative
		});
	}

	t.plan(1);

	createTestDirectory({
		title: dashify(t.title),
		template: 'must-be-preserved',
		relative
	}, destDirectory => {
		mockFileWriterOptionsObject({write, copy}, stringContent, writerConfig => {
			coreTest({
				writerConfig,
				writeToDest: custom_cwd ? writeToPath : destDirectory.join(writeToPath),
				writeToDependencies: Object.assign({}, writeToDependencies, {
					cwd: custom_cwd ? destDirectory.absolutePath : undefined
				}),
				expectedErrorMessage: expectError ? expectError.replace('{{{writeToPath}}}', destDirectory.join(writeToPath)) : null,
				assertAllFilesExist(callback){
					destDirectory.assertAllFilesExist(assertAllFilesExist, callback)
				}
			});
		});
	});
}