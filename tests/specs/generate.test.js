'use strict';

const path = require('path');

const assert = require('assert');
const test = require('ava');

const dashify = require('dashify');

const requireFromIndex = require('../utils/require-from-index'); 

const createTestDirectory = require('../utils/create-test-directory');

const mockGenerateConfigObjectKeyName = require('../mocks/mock-generate-config-object-key-name');
const mockFileContent = require('../mocks/mock-file-content');

test('type and api', t => {
	const generateFromIndex = requireFromIndex('index');
	const generate = requireFromIndex('sources/generate');

	assert(generateFromIndex === generate);
	assert(typeof generate === 'function');
});

test('create new generate function', t => {
	const generate = requireFromIndex('sources/generate')();

	assert(typeof generate === 'function');
});

test('generate instance function returns null', t => {
	const generate = requireFromIndex('sources/generate')();

	const generateResult = generate();

	assert.strictEqual(generateResult, undefined);
});

test('generate.on is a function', t => {
	const generate = requireFromIndex('sources/generate')();

	assert(typeof generate.on === 'function');
});

test('generate.off is a function', t => {
	const generate = requireFromIndex('sources/generate')();

	assert(typeof generate.off === 'function');
});

test('generate.listenableEvents', t => {
	const generate = requireFromIndex('sources/generate')();

	assert.deepEqual(generate.listenableEvents, ['write', 'finish', 'error']);
});

test.cb('end event', t => {
	const generate = requireFromIndex('sources/generate')();

	t.plan(1);

	generate();

	generate.on('finish', ()=>{
		t.pass();
		t.end();
	});
});

function testDirectoryMacro(t, core) {
	createTestDirectory({
		title: dashify(t.title),
		template: 'must-be-preserved'
	}, directory => {
		core(t, directory);
	});
}

test.cb('generate a file from a simple string content', testDirectoryMacro, (t, directory) => {
	const generate = requireFromIndex('sources/generate')();

	t.plan(2);

	const filePath = mockGenerateConfigObjectKeyName();
	const fileContent = mockFileContent();

	generate({
		[path.join(directory.path, filePath)]: fileContent
	});

	generate.on('finish', ()=>{
		t.pass();

		directory.assertAllFilesExist([...directory.initialFilesList, {
			path: filePath,
			content: fileContent
		}], ()=>{
			t.pass();
			t.end();
		});
	});
});

test.todo('generate options');

// const availableOptions = {
// 	override: [true, false, Error],
// 	backupStrategy: [false, null, 'trash', 'backup-file', function customStrategy(){}],
// 	backupStrategyOptions: {},
// 	onFileWriten: null,
// 	rootPath: ''
// };
