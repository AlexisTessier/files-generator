'use strict';

const test = require('ava');

const requireFromIndex = require('../../utils/require-from-index');

const testDirectoryMacro = require('./test-directory.macro');

const mockGenerateConfigObjectKeyName = require('../../mocks/mock-generate-config-object-key-name');
const mockFileContent = require('../../mocks/mock-file-content');

const generateMockingWriteFileMacro = require('./generate-mocking-write-file.macro');
const writeFileCallExpectOptionsMacro = require('./write-file-call-expect-options.macro');

/*----------------------------------*/

test('create new generate function', t => {
	const generate = requireFromIndex('sources/generate')();

	t.is(typeof generate, 'function');
});

test('generate instance function returns null', t => {
	const generate = requireFromIndex('sources/generate')();

	const generateResult = generate();

	t.is(generateResult, undefined);
});

/*----------------------------------*/

test.cb('generate a file from a simple string content', testDirectoryMacro, (t, directory) => {
	const generate = requireFromIndex('sources/generate')();

	t.plan(2);

	const filePath = mockGenerateConfigObjectKeyName({
		depth: 1,
		absolute: directory.path
	});
	const fileContent = mockFileContent();

	generate({
		[filePath]: fileContent
	});

	generate.on('error', () => t.fail());

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

test.cb('generate files from a simple string content to a non-existent paths', testDirectoryMacro, (t, directory) => {
	const generate = requireFromIndex('sources/generate')();

	t.plan(2);

	const filePath1 = mockGenerateConfigObjectKeyName({
		depth: 2,
		absolute: directory.path
	});
	const fileContent1 = mockFileContent();

	const filePath2 = mockGenerateConfigObjectKeyName({
		depth: 3,
		absolute: directory.path
	});
	const fileContent2 = mockFileContent();

	generate({
		[filePath1]: fileContent1,
		[filePath2]: fileContent2
	});

	generate.on('error', () => t.fail());

	generate.on('finish', ()=>{
		t.pass();

		directory.assertAllFilesExist([...directory.initialFilesList, {
			path: filePath1,
			content: fileContent1
		}, {
			path: filePath2,
			content: fileContent2
		}], ()=>{
			t.pass();
			t.end();
		});
	});
});

test.cb('generate.use() simple string as content', generateMockingWriteFileMacro, (t, writeFile, generate) => {

	const filePath = mockGenerateConfigObjectKeyName({ absolute:'/' });
	const fileContent = mockFileContent();

	generate({
		[filePath]: generate.use(fileContent)
	});

	generate.on('error', () => t.fail());

	generate.on('finish', event=>{
		t.true(writeFile.calledOnce);
		t.true(writeFile.withArgs(filePath, fileContent).calledOnce);
		writeFileCallExpectOptionsMacro(t, writeFile, 0, {});

		t.deepEqual(event, {
			data: undefined,
			errors: [],
			success: [filePath]
		});

		t.end();
	});
});

test.todo('check events behaviour for each content type');

test.todo('trying to use unhandled content type');

test.todo('other content type - see roadmap draft');