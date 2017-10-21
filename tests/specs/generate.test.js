'use strict';

const path = require('path');

const test = require('ava');
const sinon = require('sinon');

const dashify = require('dashify');

const msg = require('@alexistessier/msg');

const requireFromIndex = require('../utils/require-from-index'); 

const createTestDirectory = require('../utils/create-test-directory');

const mockGenerateConfigObjectKeyName = require('../mocks/mock-generate-config-object-key-name');
const mockFileContent = require('../mocks/mock-file-content');
const mockWriteFile = require('../mocks/mock-write-file');

function loggable(value) {
	return typeof value === 'symbol' ? value.toString() : value;
}

test('type and api', t => {
	const generateFromIndex = requireFromIndex('index');
	const generate = requireFromIndex('sources/generate');

	t.is(generateFromIndex, generate);
	t.is(typeof generate, 'function');
});

test('create new generate function', t => {
	const generate = requireFromIndex('sources/generate')();

	t.is(typeof generate, 'function');
});

test('generate instance function returns null', t => {
	const generate = requireFromIndex('sources/generate')();

	const generateResult = generate();

	t.is(generateResult, undefined);
});

test('generate.on is a function', t => {
	const g = requireFromIndex('sources/generate');

	t.is(g.on, undefined);

	const generate = g();

	t.is(typeof generate.on, 'function');
});

test('generate.off is a function', t => {
	const g = requireFromIndex('sources/generate');

	t.is(g.off, undefined);

	const generate = g();

	t.is(typeof generate.off, 'function');
});

test('generate.listenableEvents', t => {
	const g = requireFromIndex('sources/generate');

	t.is(g.listenableEvents, undefined);

	const generate = g();

	t.deepEqual(generate.listenableEvents, ['write', 'finish', 'error']);
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

function encodingNotStringErrorUsingInstanceGeneratorMacro(t, unvalidEncoding){
	const unvalidEncodingError = t.throws(()=>{
		const generate = requireFromIndex('sources/generate')({
			encoding: unvalidEncoding
		});
	});
}

encodingNotStringErrorUsingInstanceGeneratorMacro.title = (providedTitle, unvalidEncoding) => (
	`${providedTitle} - throw error if encoding using the instance generator is not a string but ${loggable(unvalidEncoding)}`
);

function encodingNotStringErrorUsingTheGenerateFunctionMacro(t, unvalidEncoding){
	const generate = requireFromIndex('sources/generate')();

	const filePath = mockGenerateConfigObjectKeyName();
	const fileContent = mockFileContent();

	const unvalidEncodingError = t.throws(()=>{
		generate({
			[filePath]: fileContent
		}, {
			encoding: unvalidEncoding,
			cwd: '/cwd/absolute/override',
			writeFile: mockWriteFile()
		});
	});
}

encodingNotStringErrorUsingTheGenerateFunctionMacro.title = (providedTitle, unvalidEncoding) => (
	`${providedTitle} - throw error if encoding using the generate function is not a string but ${loggable(unvalidEncoding)}`
);


function encodingNotStringErrorUsingUseFunctionMacro(t, unvalidEncoding){
	const generate = requireFromIndex('sources/generate')();

	const writeFile = mockWriteFile();
	const filePath = mockGenerateConfigObjectKeyName();
	const fileContent = mockFileContent();

	const unvalidEncodingError = t.throws(()=>{
		generate({
			[filePath]: generate.use(fileContent, {
				encoding: unvalidEncoding,
				cwd: '/cwd/absolute/override',
				writeFile: mockWriteFile()
			})
		});
	});
}

encodingNotStringErrorUsingUseFunctionMacro.title = (providedTitle, unvalidEncoding) => (
	`${providedTitle} - throw error if encoding using generate.use() is not a string but ${loggable(unvalidEncoding)}`
);

test(encodingNotStringErrorUsingInstanceGeneratorMacro, false);
test(encodingNotStringErrorUsingInstanceGeneratorMacro, '');
test(encodingNotStringErrorUsingInstanceGeneratorMacro, null);
test(encodingNotStringErrorUsingInstanceGeneratorMacro, Symbol());
test(encodingNotStringErrorUsingInstanceGeneratorMacro, ()=>{return;});
test(encodingNotStringErrorUsingInstanceGeneratorMacro, []);
test(encodingNotStringErrorUsingInstanceGeneratorMacro, ['hjsfd', 'g']);
test(encodingNotStringErrorUsingInstanceGeneratorMacro, true);
test(encodingNotStringErrorUsingInstanceGeneratorMacro, {});

test(encodingNotStringErrorUsingTheGenerateFunctionMacro, false);
test(encodingNotStringErrorUsingTheGenerateFunctionMacro, '');
test(encodingNotStringErrorUsingTheGenerateFunctionMacro, null);
test(encodingNotStringErrorUsingTheGenerateFunctionMacro, Symbol());
test(encodingNotStringErrorUsingTheGenerateFunctionMacro, ()=>{return;});
test(encodingNotStringErrorUsingTheGenerateFunctionMacro, []);
test(encodingNotStringErrorUsingTheGenerateFunctionMacro, ['hjsfd', 'g']);
test(encodingNotStringErrorUsingTheGenerateFunctionMacro, true);
test(encodingNotStringErrorUsingTheGenerateFunctionMacro, {});

test(encodingNotStringErrorUsingUseFunctionMacro, false);
test(encodingNotStringErrorUsingUseFunctionMacro, '');
test(encodingNotStringErrorUsingUseFunctionMacro, null);
test(encodingNotStringErrorUsingUseFunctionMacro, Symbol());
test(encodingNotStringErrorUsingUseFunctionMacro, ()=>{return;});
test(encodingNotStringErrorUsingUseFunctionMacro, []);
test(encodingNotStringErrorUsingUseFunctionMacro, ['hjsfd', 'g']);
test(encodingNotStringErrorUsingUseFunctionMacro, true);
test(encodingNotStringErrorUsingUseFunctionMacro, {});

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

/*--------------------*/
/*----- eventData ----*/
/*--------------------*/

test.cb('default eventData', testDirectoryMacro, (t, directory) => {
	const generate = requireFromIndex('sources/generate')();

	t.plan(4);

	const filePath = mockGenerateConfigObjectKeyName({
		depth: 1,
		absolute: directory.path
	});
	const fileContent = mockFileContent();

	generate({
		[filePath]: fileContent
	});

	generate.on('finish', event => {
		t.pass();

		directory.assertAllFilesExist([...directory.initialFilesList, {
			path: filePath,
			content: fileContent
		}], ()=>{
			t.is(typeof event, 'object');
			t.deepEqual(event, {data: undefined});
			t.pass();
			t.end();
		});
	});
});

test.cb('override eventData using the instance generator', testDirectoryMacro, (t, directory) => {
	const data = 'data as string';

	const generate = requireFromIndex('sources/generate')({
		eventData: data
	});

	t.plan(4);

	const filePath = mockGenerateConfigObjectKeyName({
		depth: 1,
		absolute: directory.path
	});
	const fileContent = mockFileContent();

	generate({
		[filePath]: fileContent
	});

	generate.on('finish', event=>{
		t.pass();

		directory.assertAllFilesExist([...directory.initialFilesList, {
			path: filePath,
			content: fileContent
		}], ()=>{
			t.is(typeof event, 'object');
			t.deepEqual(event, {data: 'data as string'});
			t.pass();
			t.end();
		});
	});
});

test.cb('override eventData using the generate function', testDirectoryMacro, (t, directory) => {
	const data = {dataKey: 'data value'};

	const generate = requireFromIndex('sources/generate')();

	t.plan(5);

	const filePath = mockGenerateConfigObjectKeyName({
		depth: 2,
		absolute: directory.path
	});
	const fileContent = mockFileContent();

	generate({
		[filePath]: fileContent
	}, {
		eventData: data
	});

	generate.on('finish', event=>{
		t.pass();

		directory.assertAllFilesExist([...directory.initialFilesList, {
			path: filePath,
			content: fileContent
		}], ()=>{
			t.is(typeof event, 'object');
			t.is(event.data, data);
			t.deepEqual(event, {data: {dataKey: 'data value'}});
			t.pass();
			t.end();
		});
	});
});

test.cb('override eventData using the generate function after using the instance generator', testDirectoryMacro, (t, directory) => {
	const data = 42;

	const generate = requireFromIndex('sources/generate')({
		eventData: {dataKey2: 'data value'}
	});

	t.plan(5);

	const filePath = mockGenerateConfigObjectKeyName({
		depth: 1,
		absolute: directory.path
	});
	const fileContent = mockFileContent();

	generate({
		[filePath]: fileContent
	}, {
		eventData: data
	});

	generate.on('finish', event=>{
		t.pass();

		directory.assertAllFilesExist([...directory.initialFilesList, {
			path: filePath,
			content: fileContent
		}], ()=>{
			t.is(typeof event, 'object');
			t.is(event.data, data);
			t.deepEqual(event, {data: 42});
			t.pass();
			t.end();
		});
	});
});

/*----------------------------*/
/*------- generate.use -------*/
/*----------------------------*/
test('generate.use() type', t => {
	const g = requireFromIndex('sources/generate');

	t.is(g.use, undefined);

	const generate = g();

	t.is(typeof generate.use, 'function');
});

test.cb('generate.use() simple string as content', generateMockingWriteFileMacro, (t, writeFile, generate) => {

	const filePath = mockGenerateConfigObjectKeyName({ absolute:'/' });
	const fileContent = mockFileContent();

	generate({
		[filePath]: generate.use(fileContent)
	});

	generate.on('finish', event=>{
		t.true(writeFile.calledOnce);
		t.true(writeFile.withArgs(filePath, fileContent).calledOnce);
		writeFileCallExpectOptionsMacro(t, writeFile, 0, {});

		t.deepEqual(event, {data: undefined});

		t.end();
	});
});

test('generate.use() simple string as content - trying to override eventData must cause error', generateMockingWriteFileMacro, (t, writeFile, generate) => {
	const filePath1 = mockGenerateConfigObjectKeyName({ absolute:'/' });
	const fileContent1 = mockFileContent();

	const tryingToOverrideEventDataFromGenerateUseError = t.throws(() => {
		generate({
			[filePath1]: generate.use(fileContent1, {eventData: 'data as string'})
		});
	});

	t.is(tryingToOverrideEventDataFromGenerateUseError.message, msg(
		`You are trying to use generate.use function in order to override`,
		`the eventData option with the value data as string (string).`,
		`This will not work. It's not possible.`
	));
});

test('generate.use() simple string as content - trying to override eventData even with undefined must cause error', generateMockingWriteFileMacro, (t, writeFile, generate) => {
	const filePath1 = mockGenerateConfigObjectKeyName({ absolute:'/' });
	const fileContent1 = mockFileContent();

	const tryingToOverrideEventDataFromGenerateUseError = t.throws(() => {
		generate({
			[filePath1]: generate.use(fileContent1, {eventData: undefined})
		});
	});

	t.is(tryingToOverrideEventDataFromGenerateUseError.message, msg(
		`You are trying to use generate.use function in order to override`,
		`the eventData option with the value undefined (undefined).`,
		`This will not work. It's not possible.`
	));
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

	generate.on('finish', event => {
		t.is(writeFile.callCount, 2);
		t.true(writeFile.withArgs(filePath1, fileContent1).calledOnce);
		writeFileCallExpectOptionsMacro(t, writeFile, 0, {});

		t.true(writeFile.withArgs(filePath2, fileContent2).calledOnce);
		writeFileCallExpectOptionsMacro(t, writeFile, 1, { encoding });

		t.deepEqual(event, {data: undefined});
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

	generate.on('finish', event => {
		t.true(writeFile.calledOnce);

		const expectedPath = path.join(cwd, filePath);
		t.true(writeFile.withArgs(expectedPath, fileContent).calledOnce);

		t.deepEqual(event, {data: undefined});

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

	generate.on('finish', event => {
		t.true(writeFile.calledOnce);
		t.true(writeFileBis.calledOnce);
		t.true(writeFile.withArgs(filePath1, fileContent1).calledOnce);
		t.true(writeFileBis.withArgs(filePath2, fileContent2).calledOnce);

		t.deepEqual(event, {data: undefined});

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

test.todo('write event emit');
test.todo('error event emit');

test.todo('split generate in multiple files');

test.todo('multiple generate call');

test.todo('generate options - rootPath');
test.todo('generate options - override');
test.todo('generate options - backupStrategy');
test.todo('generate options - backupStrategyOptions');

test.todo('handle wrong args types');
test.todo('remove better-assert');