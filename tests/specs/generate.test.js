'use strict';

const path = require('path');

const assert = require('assert');
const test = require('ava');
const sinon = require('sinon');

const dashify = require('dashify');

const requireFromIndex = require('../utils/require-from-index'); 

const createTestDirectory = require('../utils/create-test-directory');

const mockGenerateConfigObjectKeyName = require('../mocks/mock-generate-config-object-key-name');
const mockFileContent = require('../mocks/mock-file-content');
const mockWriteFile = require('../mocks/mock-write-file');

test('type and api', t => {
	const generateFromIndex = requireFromIndex('index');
	const generate = requireFromIndex('sources/generate');

	assert.equal(generateFromIndex, generate);
	assert.equal(typeof generate, 'function');
});

test('create new generate function', t => {
	const generate = requireFromIndex('sources/generate')();

	assert.equal(typeof generate, 'function');
});

test('generate instance function returns null', t => {
	const generate = requireFromIndex('sources/generate')();

	const generateResult = generate();

	assert.strictEqual(generateResult, undefined);
});

test('generate.on is a function', t => {
	const g = requireFromIndex('sources/generate');

	assert.equal(g.on, undefined);

	const generate = g();

	assert.equal(typeof generate.on, 'function');
});

test('generate.off is a function', t => {
	const g = requireFromIndex('sources/generate');

	assert.equal(g.off, undefined);

	const generate = g();

	assert.equal(typeof generate.off, 'function');
});

test('generate.listenableEvents', t => {
	const g = requireFromIndex('sources/generate');

	assert.equal(g.listenableEvents, undefined);

	const generate = g();

	assert.deepEqual(generate.listenableEvents, ['write', 'finish', 'error']);
});

test.cb('finish event', t => {
	const generate = requireFromIndex('sources/generate')();

	t.plan(1);

	generate();

	generate.on('finish', ()=>{
		t.pass();
		t.end();
	});
});

test.cb('finish event on', t => {
	const generate = requireFromIndex('sources/generate')();

	generate();

	const pass = sinon.spy();

	generate.on('finish', pass);

	generate.on('finish', ()=>{
		t.true(pass.calledOnce);
		t.end();
	});
});

test.cb('finish event off', t => {
	const generate = requireFromIndex('sources/generate')();

	generate();

	const pass = sinon.spy();

	generate.on('finish', pass);
	generate.off('finish', pass);

	generate.on('finish', ()=>{
		t.true(pass.notCalled);
		t.pass();
		t.end();
	});
});

test.cb('generate.off()', t => {
	const generate = requireFromIndex('sources/generate')();

	generate();

	const pass1 = sinon.spy();
	const pass2 = sinon.spy();
	const pass3 = sinon.spy();
	const pass4 = sinon.spy();
	const pass5 = sinon.spy();

	generate.on('finish', pass2);
	generate.on('write', pass3)
	generate.on('error', pass1);
	generate.on('finish', pass1);
	generate.on('write', pass2)
	generate.on('error', pass2);
	generate.on('finish', pass5);
	generate.on('write', pass5)
	generate.on('error', pass5);
	generate.on('finish', pass3);
	generate.on('write', pass1)
	generate.on('error', pass4);
	generate.on('finish', pass4);
	generate.on('write', pass4)
	generate.on('error', pass3);

	generate.off('finish', pass5);
	generate.off('finish', pass2);

	generate.on('finish', ()=>{
		t.true(pass1.calledOnce);
		t.true(pass3.calledOnce);
		t.true(pass4.calledOnce);
		t.true(pass2.notCalled);
		t.true(pass5.notCalled);

		t.end();
	});
});

/*------------------*/
/*------------------*/
/*------------------*/

function testDirectoryMacro(t, core) {
	createTestDirectory({
		title: dashify(t.title),
		template: 'must-be-preserved',
		ava_t: t
	}, directory => {
		core(t, directory);
	});
}

test.beforeEach(t => {
	t.context.writeFileDefaultOptions = {
		encoding: 'utf-8',
		cwd: process.cwd()
	};
});

function writeFileCallExpectOptionsMacro(t, writeFile, call, expectedOptions){
	const options = writeFile.getCall(call).args[2];
	expectedOptions = Object.assign({}, t.context.writeFileDefaultOptions, expectedOptions);

	t.is(options.encoding, expectedOptions.encoding);
}

function generateMockingWriteFileMacro(t, core) {
	const writeFile = mockWriteFile();
	const generate = requireFromIndex('sources/generate')({
		writeFile
	});

	core(t, writeFile, generate);
}

/*------------------*/
/*------------------*/
/*------------------*/

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

/*-------------------*/
/*----- Encoding ----*/
/*-------------------*/

test.cb('default encoding', testDirectoryMacro, (t, directory) => {
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

	generate.on('finish', ()=>{
		t.pass();

		directory.assertAllFilesExist([...directory.initialFilesList, {
			path: filePath,
			content: fileContent,
			encoding: t.context.writeFileDefaultOptions.encoding
		}], ()=>{
			t.pass();
			t.end();
		});
	});
});

test.cb('override encoding using the instance generator', testDirectoryMacro, (t, directory) => {
	const encoding = 'latin1';

	const generate = requireFromIndex('sources/generate')({
		encoding
	});

	t.plan(2);

	const filePath = mockGenerateConfigObjectKeyName({
		depth: 1,
		absolute: directory.path
	});
	const fileContent = mockFileContent();

	generate({
		[filePath]: fileContent
	});

	generate.on('finish', ()=>{
		t.pass();

		directory.assertAllFilesExist([...directory.initialFilesList, {
			path: filePath,
			content: fileContent,
			encoding
		}], ()=>{
			t.pass();
			t.end();
		});
	});
});

test.cb('override encoding using the generate function', testDirectoryMacro, (t, directory) => {
	const encoding = 'latin1';

	const generate = requireFromIndex('sources/generate')();

	t.plan(2);

	const filePath = mockGenerateConfigObjectKeyName({
		depth: 1,
		absolute: directory.path
	});
	const fileContent = mockFileContent();

	generate({
		[filePath]: fileContent
	}, {
		encoding
	});

	generate.on('finish', ()=>{
		t.pass();

		directory.assertAllFilesExist([...directory.initialFilesList, {
			path: filePath,
			content: fileContent,
			encoding
		}], ()=>{
			t.pass();
			t.end();
		});
	});
});

test.cb('override encoding using the generate function after using the instance generator', testDirectoryMacro, (t, directory) => {
	const encoding = 'latin1';

	const generate = requireFromIndex('sources/generate')({
		encoding: 'utf-8'
	});

	t.plan(2);

	const filePath = mockGenerateConfigObjectKeyName({
		depth: 1,
		absolute: directory.path
	});
	const fileContent = mockFileContent();

	generate({
		[filePath]: fileContent
	}, {
		encoding
	});

	generate.on('finish', ()=>{
		t.pass();

		directory.assertAllFilesExist([...directory.initialFilesList, {
			path: filePath,
			content: fileContent,
			encoding
		}], ()=>{
			t.pass();
			t.end();
		});
	});
});

/*---------------*/
/*----- cwd -----*/
/*---------------*/

test.cb('default cwd', generateMockingWriteFileMacro, (t, writeFile, generate) => {
	const filePath = mockGenerateConfigObjectKeyName({
		depth: 1
	});
	const fileContent = mockFileContent();

	generate({
		[filePath]: fileContent
	});

	generate.on('finish', ()=>{
		t.true(writeFile.calledOnce);

		const expectedPath = path.join(t.context.writeFileDefaultOptions.cwd, filePath);
		t.true(writeFile.withArgs(expectedPath, fileContent).calledOnce);

		t.end();
	});
});

test.cb('override cwd using the instance generator', t => {
	const cwd = '/cwd/override';

	const writeFile = mockWriteFile();
	const generate = requireFromIndex('sources/generate')({
		cwd,
		writeFile
	});

	const filePath = mockGenerateConfigObjectKeyName();
	const fileContent = mockFileContent();

	generate({
		[filePath]: fileContent
	});

	generate.on('finish', ()=>{
		t.true(writeFile.calledOnce);

		const expectedPath = path.join(cwd, filePath);
		t.true(writeFile.withArgs(expectedPath, fileContent).calledOnce);

		t.end();
	});
});

test.cb('override cwd using the generate function', t => {
	const cwd = '/cwd/override';

	const writeFile = mockWriteFile();
	const generate = requireFromIndex('sources/generate')();

	const filePath = mockGenerateConfigObjectKeyName();
	const fileContent = mockFileContent();

	generate({
		[filePath]: fileContent
	}, {
		cwd,
		writeFile
	});

	generate.on('finish', ()=>{
		t.true(writeFile.calledOnce);

		const expectedPath = path.join(cwd, filePath);
		t.true(writeFile.withArgs(expectedPath, fileContent).calledOnce);

		t.end();
	});
});

test.cb('override cwd using the generate function after using the instance generator', t => {
	const cwd = '/cwd/override';

	const writeFile = mockWriteFile();
	const generate = requireFromIndex('sources/generate')({
		cwd: '/other/cwd/override'
	});

	const filePath = mockGenerateConfigObjectKeyName();
	const fileContent = mockFileContent();

	generate({
		[filePath]: fileContent
	}, {
		cwd,
		writeFile
	});

	generate.on('finish', ()=>{
		t.true(writeFile.calledOnce);

		const expectedPath = path.join(cwd, filePath);
		t.true(writeFile.withArgs(expectedPath, fileContent).calledOnce);

		t.end();
	});
});

test('throw error if cwd using the instance generator is not an absolute path', t => {
	const cwd = 'cwd/relative/override';

	const cwdRelativeError = t.throws(()=>{
		const generate = requireFromIndex('sources/generate')({cwd});
	});

	t.is(cwdRelativeError.message, `You must provide an absolute cwd path. "${cwd}" is a relative one.`)
});

test('throw error if cwd using the generate function is not an absolute path', t => {
	const cwd = 'cwd/relative/override';

	const writeFile = mockWriteFile();
	const generate = requireFromIndex('sources/generate')();

	const filePath = mockGenerateConfigObjectKeyName();
	const fileContent = mockFileContent();

	const cwdRelativeError = t.throws(()=>{
		generate({
			[filePath]: fileContent
		}, {
			cwd,
			writeFile
		});
	});

	t.is(cwdRelativeError.message, `You must provide an absolute cwd path. "${cwd}" is a relative one.`)
});

test('throw error if cwd using generate.use() is not an absolute path', t => {
	const cwd = 'cwd/relative/override';

	const writeFile = mockWriteFile();
	const generate = requireFromIndex('sources/generate')();

	const filePath = mockGenerateConfigObjectKeyName();
	const fileContent = mockFileContent();

	const cwdRelativeError = t.throws(()=>{
		generate({
			[filePath]: generate.use(fileContent, {cwd})
		});
	});

	t.is(cwdRelativeError.message, `You must provide an absolute cwd path. "${cwd}" is a relative one.`)
});

/*--------------------*/
/*----- writeFile ----*/
/*--------------------*/

test.cb('override writeFile function using the instance generator', testDirectoryMacro, (t, directory) => {
	const writeFile = mockWriteFile();
	const generate = requireFromIndex('sources/generate')({
		writeFile
	});

	t.plan(4);

	const filePath = mockGenerateConfigObjectKeyName({
		absolute: directory.path
	});
	const fileContent = mockFileContent();

	generate({
		[filePath]: fileContent
	});

	generate.on('finish', ()=>{
		t.pass();

		t.true(writeFile.calledOnce);
		t.true(writeFile.withArgs(filePath, fileContent).calledOnce);

		directory.assertAllFilesExist([...directory.initialFilesList, {
			path: filePath,
			content: false
		}], ()=>{
			t.pass();
			t.end();
		});
	});
});

test.cb('override writeFile function using the generate function', testDirectoryMacro, (t, directory) => {
	const writeFile = mockWriteFile();
	const generate = requireFromIndex('sources/generate')();

	t.plan(4);

	const filePath = mockGenerateConfigObjectKeyName({
		absolute: directory.path
	});
	const fileContent = mockFileContent();

	generate({
		[filePath]: fileContent
	}, {
		writeFile
	});

	generate.on('finish', ()=>{
		t.pass();

		t.true(writeFile.calledOnce);
		t.true(writeFile.withArgs(filePath, fileContent).calledOnce);

		directory.assertAllFilesExist([...directory.initialFilesList, {
			path: filePath,
			content: false
		}], ()=>{
			t.pass();
			t.end();
		});
	});
});

test.cb('override writeFile function using the instance generator - default options', t => {
	const writeFile = mockWriteFile();
	const generate = requireFromIndex('sources/generate')({
		writeFile
	});

	const filePath = mockGenerateConfigObjectKeyName({ absolute: '/' });
	const fileContent = mockFileContent();

	generate({
		[filePath]: fileContent
	});

	generate.on('finish', ()=>{
		t.true(writeFile.calledOnce);

		t.true(writeFile.withArgs(filePath, fileContent).calledOnce);
		writeFileCallExpectOptionsMacro(t, writeFile, 0, {});

		t.end();
	});
});

test.cb('override writeFile function using the generate function - default options', t => {
	const writeFile = mockWriteFile();
	const generate = requireFromIndex('sources/generate')();

	const filePath = mockGenerateConfigObjectKeyName({ absolute: '/' });
	const fileContent = mockFileContent();

	generate({
		[filePath]: fileContent
	}, {
		writeFile
	});

	generate.on('finish', ()=>{
		t.true(writeFile.calledOnce);

		t.true(writeFile.withArgs(filePath, fileContent).calledOnce);
		writeFileCallExpectOptionsMacro(t, writeFile, 0, {});

		t.end();
	});
});

/*--------------------------------*/
/*----- writeFile && encoding ----*/
/*--------------------------------*/

test.cb('override writeFile function using the instance generator - encoding options', t => {
	const encoding = 'latin1';

	const writeFile = mockWriteFile();
	const generate = requireFromIndex('sources/generate')({
		writeFile,
		encoding
	});

	const filePath = mockGenerateConfigObjectKeyName({ absolute: '/' });
	const fileContent = mockFileContent();

	generate({
		[filePath]: fileContent
	});

	generate.on('finish', ()=>{
		t.true(writeFile.calledOnce);

		t.true(writeFile.withArgs(filePath, fileContent).calledOnce);
		writeFileCallExpectOptionsMacro(t, writeFile, 0, { encoding });

		t.end();
	});
});

test.cb('override writeFile function using the instance generator - encoding options in the generate function', t => {
	const encoding = 'latin1';

	const writeFile = mockWriteFile();
	const generate = requireFromIndex('sources/generate')({
		writeFile
	});

	const filePath = mockGenerateConfigObjectKeyName({ absolute : '/' });
	const fileContent = mockFileContent();

	generate({
		[filePath]: fileContent
	}, { encoding });

	generate.on('finish', ()=>{
		t.true(writeFile.calledOnce);

		t.true(writeFile.withArgs(filePath, fileContent).calledOnce);
		writeFileCallExpectOptionsMacro(t, writeFile, 0, { encoding });

		t.end();
	});
});

test.cb('override writeFile function using the generate function - encoding option', t => {
	const encoding = 'latin1';

	const writeFile = mockWriteFile();
	const generate = requireFromIndex('sources/generate')();

	const filePath = mockGenerateConfigObjectKeyName({ absolute: '/' });
	const fileContent = mockFileContent();

	generate({
		[filePath]: fileContent
	}, {
		writeFile,
		encoding
	});

	generate.on('finish', ()=>{
		t.true(writeFile.calledOnce);

		t.true(writeFile.withArgs(filePath, fileContent).calledOnce);
		writeFileCallExpectOptionsMacro(t, writeFile, 0, { encoding });

		t.end();
	});
});

test.cb('override writeFile function using the generate function - encoding option in the instance generator', t => {
	const encoding = 'latin1';

	const writeFile = mockWriteFile();
	const generate = requireFromIndex('sources/generate')({
		encoding
	});

	const filePath = mockGenerateConfigObjectKeyName({ absolute: '/' });
	const fileContent = mockFileContent();

	generate({
		[filePath]: fileContent
	}, {
		writeFile
	});

	generate.on('finish', ()=>{
		t.true(writeFile.calledOnce);

		t.true(writeFile.withArgs(filePath, fileContent).calledOnce);
		writeFileCallExpectOptionsMacro(t, writeFile, 0, { encoding });

		t.end();
	});
});

/*----------------------------*/
/*------- generate.use -------*/
/*----------------------------*/
test('generate.use() type', t => {
	const g = requireFromIndex('sources/generate');

	assert.equal(g.use, undefined);

	const generate = g();

	assert.equal(typeof generate.use, 'function');
});

test.cb('generate.use() simple string as content', generateMockingWriteFileMacro, (t, writeFile, generate) => {

	const filePath = mockGenerateConfigObjectKeyName({ absolute:'/' });
	const fileContent = mockFileContent();

	generate({
		[filePath]: generate.use(fileContent)
	});

	generate.on('finish', ()=>{
		t.true(writeFile.calledOnce);
		t.true(writeFile.withArgs(filePath, fileContent).calledOnce);
		writeFileCallExpectOptionsMacro(t, writeFile, 0, {});
		t.end();
	});
});

test.cb('generate.use() simple string as content - override encoding', generateMockingWriteFileMacro, (t, writeFile, generate) => {
	const encoding = 'latin1';

	const filePath1 = mockGenerateConfigObjectKeyName({ absolute:'/' });
	const fileContent1 = mockFileContent();
	const filePath2 = mockGenerateConfigObjectKeyName({ absolute:'/' });
	const fileContent2 = mockFileContent();

	generate({
		[filePath1]: generate.use(fileContent1),
		[filePath2]: generate.use(fileContent2, {encoding})
	});

	generate.on('finish', () => {
		t.is(writeFile.callCount, 2);
		t.true(writeFile.withArgs(filePath1, fileContent1).calledOnce);
		writeFileCallExpectOptionsMacro(t, writeFile, 0, {});

		t.true(writeFile.withArgs(filePath2, fileContent2).calledOnce);
		writeFileCallExpectOptionsMacro(t, writeFile, 1, { encoding });
		t.end();
	});
});

test.cb('generate.use() simple string as content - override cwd', generateMockingWriteFileMacro, (t, writeFile, generate) => {
	const cwd = '/cwd/override';

	const filePath = mockGenerateConfigObjectKeyName();
	const fileContent = mockFileContent();

	generate({
		[filePath]: generate.use(fileContent, {cwd}),
	});

	generate.on('finish', () => {
		t.true(writeFile.calledOnce);

		const expectedPath = path.join(cwd, filePath);
		t.true(writeFile.withArgs(expectedPath, fileContent).calledOnce);

		t.end();
	});
});

test.cb('generate.use() simple string as content - override writeFile', generateMockingWriteFileMacro, (t, writeFile, generate) => {
	const writeFileBis = mockWriteFile();

	const filePath1 = mockGenerateConfigObjectKeyName({ absolute:'/' });
	const fileContent1 = mockFileContent();
	const filePath2 = mockGenerateConfigObjectKeyName({ absolute:'/' });
	const fileContent2 = mockFileContent();

	generate({
		[filePath1]: generate.use(fileContent1),
		[filePath2]: generate.use(fileContent2, {writeFile: writeFileBis})
	});

	generate.on('finish', () => {
		t.true(writeFile.calledOnce);
		t.true(writeFileBis.calledOnce);
		t.true(writeFile.withArgs(filePath1, fileContent1).calledOnce);
		t.true(writeFileBis.withArgs(filePath2, fileContent2).calledOnce);
		t.end();
	});
});

test.cb('generate.use() simple string as content - override all the options', generateMockingWriteFileMacro, (t, writeFile, generate) => {
	const encoding = 'latin1';
	const cwd = '/cwd/override';

	const writeFile2 = mockWriteFile();
	const filePath = mockGenerateConfigObjectKeyName();
	const fileContent = mockFileContent();

	generate({
		[filePath]: generate.use(fileContent, {
			writeFile: writeFile2,
			encoding,
			cwd
		}),
	});

	generate.on('finish', () => {
		t.true(writeFile.notCalled);
		t.true(writeFile2.calledOnce);

		const expectedPath = path.join(cwd, filePath);
		t.true(writeFile2.withArgs(expectedPath, fileContent).calledOnce);
		writeFileCallExpectOptionsMacro(t, writeFile2, 0, { encoding });

		t.end();
	});
});

test.todo('generate options');
