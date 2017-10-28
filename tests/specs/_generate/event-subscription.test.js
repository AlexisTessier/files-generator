'use strict';

const test = require('ava');

const path = require('path');
const sinon = require('sinon');

const requireFromIndex = require('../../utils/require-from-index');

const testDirectoryMacro = require('./test-directory.macro');

const mockGenerateConfigObjectKeyName = require('../../mocks/mock-generate-config-object-key-name');
const mockFileContent = require('../../mocks/mock-file-content');

/*------------------------*/

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

/*------------------------*/

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

test.cb('finish event off with multiple handlers', t => {
	const generate = requireFromIndex('sources/generate')();

	generate();

	const pass = sinon.spy();
	const pass2 = sinon.spy();

	generate.on('finish', pass2);
	generate.on('finish', pass);
	generate.off('finish', pass);

	generate.on('finish', ()=>{
		t.true(pass.notCalled);
		t.true(pass2.calledOnce);
		t.pass();
		t.end();
	});
});

/*-----------------------*/

test.cb('write event', testDirectoryMacro, (t, directory) => {
	const generate = requireFromIndex('sources/generate')();

	t.plan(3);

	const filePathOne = path.join(directory.path, 'john-connor.txt');
	const filePathTwo = path.join(directory.path, 'sarah-connor.txt');
	const filePathThree = path.join(directory.path, 'T-800.txt');

	generate({
		[filePathOne]: 'Son of Sarah Connor and saviour of the humanity.',
		[filePathTwo]: 'Mother of John Connor',
		[filePathThree]: 'Governator of California'
	});

	generate.on('write', ()=>{
		t.pass();
	});

	generate.on('finish', ()=>{
		t.end();
	})
});

test.cb('write event emmited after file was created', testDirectoryMacro, (t, directory) => {
	const generate = requireFromIndex('sources/generate')();

	const filePathOne = mockGenerateConfigObjectKeyName({
		depth: 1,
		absolute: directory.path
	});

	const filePathTwo = mockGenerateConfigObjectKeyName({
		depth: 2,
		absolute: directory.path
	});

	const fileContentOne = mockFileContent();
	const fileContentTwo = mockFileContent();

	t.plan(7);

	generate({
		[filePathOne]: fileContentOne,
		[filePathTwo]: fileContentTwo
	});

	const writtenFiles = [];

	generate.on('write', event => {
		t.is(typeof event, 'object');
		t.is(typeof event.filepath, 'string');

		writtenFiles.push(event.filepath);

		directory.assertAllFilesExist([...directory.initialFilesList, {
			path: event.filepath,
			content: ({
				[filePathOne]: fileContentOne,
				[filePathTwo]: fileContentTwo
			})[event.filepath]
		}], ()=>{
			end();
		}, {ava_t: t});
	});

	generate.on('finish', ()=>{
		t.is(writtenFiles.length, 2);
		t.true(writtenFiles.includes(filePathOne));
		t.true(writtenFiles.includes(filePathTwo));
		end();
	});

	let endCallCount = 0;
	function end() {
		endCallCount++;
		if (endCallCount === 3) {
			t.end();
		}
	}
});

test.cb('write event off', testDirectoryMacro, (t, directory) => {
	const generate = requireFromIndex('sources/generate')();

	const filePathOne = mockGenerateConfigObjectKeyName({
		depth: 2,
		absolute: directory.path
	});

	const filePathTwo = mockGenerateConfigObjectKeyName({
		depth: 2,
		absolute: directory.path
	});

	const fileContentOne = mockFileContent();
	const fileContentTwo = mockFileContent();

	generate({
		[filePathOne]: fileContentOne,
		[filePathTwo]: fileContentTwo
	});

	const handler = sinon.spy();

	generate.on('write', handler);

	generate.off('write', handler);

	generate.on('finish', ()=>{
		t.true(handler.notCalled);
		t.end();
	});
});

test.cb('write event off with multiple handlers', testDirectoryMacro, (t, directory) => {
	const generate = requireFromIndex('sources/generate')();

	const filePathOne = mockGenerateConfigObjectKeyName({
		depth: 2,
		absolute: directory.path
	});

	const filePathTwo = mockGenerateConfigObjectKeyName({
		depth: 2,
		absolute: directory.path
	});

	const fileContentOne = mockFileContent();
	const fileContentTwo = mockFileContent();

	generate({
		[filePathOne]: fileContentOne,
		[filePathTwo]: fileContentTwo
	});

	const handler1 = sinon.spy();
	const handler2 = sinon.spy();

	generate.on('write', handler1);
	generate.on('write', handler2);

	generate.off('write', handler1);

	generate.on('finish', ()=>{
		t.true(handler1.notCalled);
		t.true(handler2.calledTwice);

		const filepathsWritten = [];
		[0, 1].map(c => handler2.getCall(c).args).forEach(args => {
			t.is(args.length, 1);
			const event = args[0];

			t.is(typeof event, 'object');
			t.is(event.data, undefined);
			filepathsWritten.push(event.filepath);
		});

		t.true(filepathsWritten.includes(filePathOne));
		t.true(filepathsWritten.includes(filePathTwo));

		t.end();
	});
});

/*-----------------------*/

test.cb('error event on - event not emitted if no errors', testDirectoryMacro, (t, directory) => {
	const generate = requireFromIndex('sources/generate')();

	const filePathOne = mockGenerateConfigObjectKeyName({
		depth: 2,
		absolute: directory.path
	});

	const filePathTwo = mockGenerateConfigObjectKeyName({
		depth: 3,
		absolute: directory.path
	});

	const fileContentOne = mockFileContent();
	const fileContentTwo = mockFileContent();

	generate({
		[filePathOne]: fileContentOne,
		[filePathTwo]: fileContentTwo
	});

	generate.on('error', ()=>{
		t.fail();
	});

	generate.on('finish', ()=>{
		t.end();
	});
});

test.cb('error event on - event emitted when writeFile function call the callback with an error', testDirectoryMacro, (t, directory) => {
	const generate = requireFromIndex('sources/generate')({
		writeFile(filePath, content, options, writeFileCallback){
			writeFileCallback(new Error('write file error'));
		}
	});

	const filePathOne = mockGenerateConfigObjectKeyName({
		depth: 2,
		absolute: directory.path
	});

	const fileContentOne = mockFileContent();

	const filePathTwo = mockGenerateConfigObjectKeyName({
		depth: 2,
		absolute: directory.path
	});

	const fileContentTwo = mockFileContent();

	generate({
		[filePathOne]: fileContentOne,
		[filePathTwo]: fileContentTwo
	});

	generate.on('error', event=>{
		t.is(typeof event, 'object');
		t.is(event.data, undefined);
		t.true(event.error instanceof Error);
		t.is(event.error.message, `Error writing file at path "${filePathOne}" => write file error`);
		t.pass();
		t.end();
	})

	generate.on('write', ()=>{
		t.fail();
	});

	generate.on('finish', ()=>{
		t.fail();
	});
});

test.todo('error event on - event emitted when error happens in a eventListener');

test.todo('error event on - event emitted multiple time');

test.todo('error event off');

test.todo('error event off with multiple handlers');

/*-----------------------*/

test.todo('generate multiple on for the same event (test with finish event)');
test.todo('generate multiple off for the same event (test with finish event)');

test.todo('generate multiple on for the same event (test with write event)');
test.todo('generate multiple off for the same event (test with write event)');

test.todo('generate multiple on for the same event (test with error event)');
test.todo('generate multiple off for the same event (test with error event)');

test.todo('generate multiple on for the same handler');
test.todo('generate multiple off for the same handler');

test.todo('generate multiple on for the same event and handler (test with finish event)');
test.todo('generate multiple off for the same event and handler (test with finish event)');

test.todo('generate multiple on for the same event and handler (test with write event)');
test.todo('generate multiple off for the same event and handler (test with write event)');

test.todo('generate multiple on for the same event and handler (test with error event)');
test.todo('generate multiple off for the same event and handler (test with error event)');

/*-----------------------*/

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

/*--------------------*/
/*----- eventData ----*/
/*--------------------*/

test.cb('default eventData with finish event', testDirectoryMacro, (t, directory) => {
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
		}, {ava_t: t});
	});
});

test.cb('override eventData using the instance generator with finish event', testDirectoryMacro, (t, directory) => {
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

test.cb('override eventData using the generate function with finish event', testDirectoryMacro, (t, directory) => {
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

test.cb('override eventData using the generate function after using the instance generator with finish event', testDirectoryMacro, (t, directory) => {
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

test.todo('default eventData with write event');
test.todo('override eventData using the instance generator with write event');
test.todo('override eventData using the generate function with write event');
test.todo('override eventData using the generate function after using the instance generator with write event');

test.todo('default eventData with error event');
test.todo('override eventData using the instance generator with error event');
test.todo('override eventData using the generate function with error event');
test.todo('override eventData using the generate function after using the instance generator with error event');

/*----------------*/

function generateOnWithWrongArgumentsMacro(t, errorMessage, ...wrongArgs) {
	const generate = requireFromIndex('sources/generate')();

	const onWrongArgsError = t.throws(() => {
		generate.on(...wrongArgs);
	});

	t.is(onWrongArgsError.message, errorMessage);
}

generateOnWithWrongArgumentsMacro.title = providedTitle => (
	`generate on with wrong arguments - ${providedTitle}`
)

const wrongEventParameterErrorMessage =
	'The event parameter must be one of the following string: "write", "finish" or "error".';

const wrongListenerParameterErrorMessage =
	'The event listener parameter must be a function.';

test('without parameters', generateOnWithWrongArgumentsMacro, wrongEventParameterErrorMessage);
test('with function', generateOnWithWrongArgumentsMacro, wrongEventParameterErrorMessage, function test() {return;});
test('with number', generateOnWithWrongArgumentsMacro, wrongEventParameterErrorMessage, 42);
test('with symbol', generateOnWithWrongArgumentsMacro, wrongEventParameterErrorMessage, Symbol());
test('with object', generateOnWithWrongArgumentsMacro, wrongEventParameterErrorMessage, {});
test('with array', generateOnWithWrongArgumentsMacro, wrongEventParameterErrorMessage, [87, false]);
test('with empty array', generateOnWithWrongArgumentsMacro, wrongEventParameterErrorMessage, []);
test('with true', generateOnWithWrongArgumentsMacro, wrongEventParameterErrorMessage, true);
test('with false', generateOnWithWrongArgumentsMacro, wrongEventParameterErrorMessage, false);
test('with null', generateOnWithWrongArgumentsMacro, wrongEventParameterErrorMessage, null);
test('with undefined', generateOnWithWrongArgumentsMacro, wrongEventParameterErrorMessage, undefined);
test('with wrong string', generateOnWithWrongArgumentsMacro, wrongEventParameterErrorMessage, 'wite');
test('with wrong string 2', generateOnWithWrongArgumentsMacro, wrongEventParameterErrorMessage, 'finih');
test('with wrong string 3', generateOnWithWrongArgumentsMacro, wrongEventParameterErrorMessage, 'err');
test('with empty string', generateOnWithWrongArgumentsMacro, wrongEventParameterErrorMessage, '  	');

test('without parameters', generateOnWithWrongArgumentsMacro, wrongListenerParameterErrorMessage, 'write');
test('with number', generateOnWithWrongArgumentsMacro, wrongListenerParameterErrorMessage, 'write', 42);
test('with symbol', generateOnWithWrongArgumentsMacro, wrongListenerParameterErrorMessage, 'write', Symbol());
test('with object', generateOnWithWrongArgumentsMacro, wrongListenerParameterErrorMessage, 'write', {});
test('with array', generateOnWithWrongArgumentsMacro, wrongListenerParameterErrorMessage, 'write', [87, false]);
test('with empty array', generateOnWithWrongArgumentsMacro, wrongListenerParameterErrorMessage, 'write', []);
test('with true', generateOnWithWrongArgumentsMacro, wrongListenerParameterErrorMessage, 'write', true);
test('with false', generateOnWithWrongArgumentsMacro, wrongListenerParameterErrorMessage, 'write', false);
test('with null', generateOnWithWrongArgumentsMacro, wrongListenerParameterErrorMessage, 'write', null);
test('with undefined', generateOnWithWrongArgumentsMacro, wrongListenerParameterErrorMessage, 'write', undefined);
test('with wrong string', generateOnWithWrongArgumentsMacro, wrongListenerParameterErrorMessage, 'write', 'write');
test('with wrong string 2', generateOnWithWrongArgumentsMacro, wrongListenerParameterErrorMessage, 'write', 'finish');
test('with wrong string 3', generateOnWithWrongArgumentsMacro, wrongListenerParameterErrorMessage, 'write', 'error');
test('with empty string', generateOnWithWrongArgumentsMacro, wrongListenerParameterErrorMessage, 'write', '  	');

test('without parameters', generateOnWithWrongArgumentsMacro, wrongListenerParameterErrorMessage, 'finish');
test('with number', generateOnWithWrongArgumentsMacro, wrongListenerParameterErrorMessage, 'finish', 42);
test('with symbol', generateOnWithWrongArgumentsMacro, wrongListenerParameterErrorMessage, 'finish', Symbol());
test('with object', generateOnWithWrongArgumentsMacro, wrongListenerParameterErrorMessage, 'finish', {});
test('with array', generateOnWithWrongArgumentsMacro, wrongListenerParameterErrorMessage, 'finish', [87, false]);
test('with empty array', generateOnWithWrongArgumentsMacro, wrongListenerParameterErrorMessage, 'finish', []);
test('with true', generateOnWithWrongArgumentsMacro, wrongListenerParameterErrorMessage, 'finish', true);
test('with false', generateOnWithWrongArgumentsMacro, wrongListenerParameterErrorMessage, 'finish', false);
test('with null', generateOnWithWrongArgumentsMacro, wrongListenerParameterErrorMessage, 'finish', null);
test('with undefined', generateOnWithWrongArgumentsMacro, wrongListenerParameterErrorMessage, 'finish', undefined);
test('with wrong string', generateOnWithWrongArgumentsMacro, wrongListenerParameterErrorMessage, 'finish', 'write');
test('with wrong string 2', generateOnWithWrongArgumentsMacro, wrongListenerParameterErrorMessage, 'finish', 'finish');
test('with wrong string 3', generateOnWithWrongArgumentsMacro, wrongListenerParameterErrorMessage, 'finish', 'error');
test('with empty string', generateOnWithWrongArgumentsMacro, wrongListenerParameterErrorMessage, 'finish', '  	');

test('without parameters', generateOnWithWrongArgumentsMacro, wrongListenerParameterErrorMessage, 'error');
test('with number', generateOnWithWrongArgumentsMacro, wrongListenerParameterErrorMessage, 'error', 42);
test('with symbol', generateOnWithWrongArgumentsMacro, wrongListenerParameterErrorMessage, 'error', Symbol());
test('with object', generateOnWithWrongArgumentsMacro, wrongListenerParameterErrorMessage, 'error', {});
test('with array', generateOnWithWrongArgumentsMacro, wrongListenerParameterErrorMessage, 'error', [87, false]);
test('with empty array', generateOnWithWrongArgumentsMacro, wrongListenerParameterErrorMessage, 'error', []);
test('with true', generateOnWithWrongArgumentsMacro, wrongListenerParameterErrorMessage, 'error', true);
test('with false', generateOnWithWrongArgumentsMacro, wrongListenerParameterErrorMessage, 'error', false);
test('with null', generateOnWithWrongArgumentsMacro, wrongListenerParameterErrorMessage, 'error', null);
test('with undefined', generateOnWithWrongArgumentsMacro, wrongListenerParameterErrorMessage, 'error', undefined);
test('with wrong string', generateOnWithWrongArgumentsMacro, wrongListenerParameterErrorMessage, 'error', 'write');
test('with wrong string 2', generateOnWithWrongArgumentsMacro, wrongListenerParameterErrorMessage, 'error', 'finish');
test('with wrong string 3', generateOnWithWrongArgumentsMacro, wrongListenerParameterErrorMessage, 'error', 'error');
test('with empty string', generateOnWithWrongArgumentsMacro, wrongListenerParameterErrorMessage, 'error', '  	');

function generateOffWithWrongArgumentsMacro(t, errorMessage, ...wrongArgs) {
	const generate = requireFromIndex('sources/generate')();

	const offWrongArgsError = t.throws(() => {
		generate.off(...wrongArgs);
	});

	t.is(offWrongArgsError.message, errorMessage);
}

generateOffWithWrongArgumentsMacro.title = providedTitle => (
	`generate off with wrong arguments - ${providedTitle}`
)

test('without parameters', generateOffWithWrongArgumentsMacro, wrongEventParameterErrorMessage);
test('with function', generateOffWithWrongArgumentsMacro, wrongEventParameterErrorMessage, function test() {return;});
test('with number', generateOffWithWrongArgumentsMacro, wrongEventParameterErrorMessage, 42);
test('with symbol', generateOffWithWrongArgumentsMacro, wrongEventParameterErrorMessage, Symbol());
test('with object', generateOffWithWrongArgumentsMacro, wrongEventParameterErrorMessage, {});
test('with array', generateOffWithWrongArgumentsMacro, wrongEventParameterErrorMessage, [87, false]);
test('with empty array', generateOffWithWrongArgumentsMacro, wrongEventParameterErrorMessage, []);
test('with true', generateOffWithWrongArgumentsMacro, wrongEventParameterErrorMessage, true);
test('with false', generateOffWithWrongArgumentsMacro, wrongEventParameterErrorMessage, false);
test('with null', generateOffWithWrongArgumentsMacro, wrongEventParameterErrorMessage, null);
test('with undefined', generateOffWithWrongArgumentsMacro, wrongEventParameterErrorMessage, undefined);
test('with wrong string', generateOffWithWrongArgumentsMacro, wrongEventParameterErrorMessage, 'wite');
test('with wrong string 2', generateOffWithWrongArgumentsMacro, wrongEventParameterErrorMessage, 'finih');
test('with wrong string 3', generateOffWithWrongArgumentsMacro, wrongEventParameterErrorMessage, 'err');
test('with empty string', generateOffWithWrongArgumentsMacro, wrongEventParameterErrorMessage, '  	');

test('without parameters', generateOffWithWrongArgumentsMacro, wrongListenerParameterErrorMessage, 'write');
test('with number', generateOffWithWrongArgumentsMacro, wrongListenerParameterErrorMessage, 'write', 42);
test('with symbol', generateOffWithWrongArgumentsMacro, wrongListenerParameterErrorMessage, 'write', Symbol());
test('with object', generateOffWithWrongArgumentsMacro, wrongListenerParameterErrorMessage, 'write', {});
test('with array', generateOffWithWrongArgumentsMacro, wrongListenerParameterErrorMessage, 'write', [87, false]);
test('with empty array', generateOffWithWrongArgumentsMacro, wrongListenerParameterErrorMessage, 'write', []);
test('with true', generateOffWithWrongArgumentsMacro, wrongListenerParameterErrorMessage, 'write', true);
test('with false', generateOffWithWrongArgumentsMacro, wrongListenerParameterErrorMessage, 'write', false);
test('with null', generateOffWithWrongArgumentsMacro, wrongListenerParameterErrorMessage, 'write', null);
test('with undefined', generateOffWithWrongArgumentsMacro, wrongListenerParameterErrorMessage, 'write', undefined);
test('with wrong string', generateOffWithWrongArgumentsMacro, wrongListenerParameterErrorMessage, 'write', 'write');
test('with wrong string 2', generateOffWithWrongArgumentsMacro, wrongListenerParameterErrorMessage, 'write', 'finish');
test('with wrong string 3', generateOffWithWrongArgumentsMacro, wrongListenerParameterErrorMessage, 'write', 'error');
test('with empty string', generateOffWithWrongArgumentsMacro, wrongListenerParameterErrorMessage, 'write', '  	');

test('without parameters', generateOffWithWrongArgumentsMacro, wrongListenerParameterErrorMessage, 'finish');
test('with number', generateOffWithWrongArgumentsMacro, wrongListenerParameterErrorMessage, 'finish', 42);
test('with symbol', generateOffWithWrongArgumentsMacro, wrongListenerParameterErrorMessage, 'finish', Symbol());
test('with object', generateOffWithWrongArgumentsMacro, wrongListenerParameterErrorMessage, 'finish', {});
test('with array', generateOffWithWrongArgumentsMacro, wrongListenerParameterErrorMessage, 'finish', [87, false]);
test('with empty array', generateOffWithWrongArgumentsMacro, wrongListenerParameterErrorMessage, 'finish', []);
test('with true', generateOffWithWrongArgumentsMacro, wrongListenerParameterErrorMessage, 'finish', true);
test('with false', generateOffWithWrongArgumentsMacro, wrongListenerParameterErrorMessage, 'finish', false);
test('with null', generateOffWithWrongArgumentsMacro, wrongListenerParameterErrorMessage, 'finish', null);
test('with undefined', generateOffWithWrongArgumentsMacro, wrongListenerParameterErrorMessage, 'finish', undefined);
test('with wrong string', generateOffWithWrongArgumentsMacro, wrongListenerParameterErrorMessage, 'finish', 'write');
test('with wrong string 2', generateOffWithWrongArgumentsMacro, wrongListenerParameterErrorMessage, 'finish', 'finish');
test('with wrong string 3', generateOffWithWrongArgumentsMacro, wrongListenerParameterErrorMessage, 'finish', 'error');
test('with empty string', generateOffWithWrongArgumentsMacro, wrongListenerParameterErrorMessage, 'finish', '  	');

test('without parameters', generateOffWithWrongArgumentsMacro, wrongListenerParameterErrorMessage, 'error');
test('with number', generateOffWithWrongArgumentsMacro, wrongListenerParameterErrorMessage, 'error', 42);
test('with symbol', generateOffWithWrongArgumentsMacro, wrongListenerParameterErrorMessage, 'error', Symbol());
test('with object', generateOffWithWrongArgumentsMacro, wrongListenerParameterErrorMessage, 'error', {});
test('with array', generateOffWithWrongArgumentsMacro, wrongListenerParameterErrorMessage, 'error', [87, false]);
test('with empty array', generateOffWithWrongArgumentsMacro, wrongListenerParameterErrorMessage, 'error', []);
test('with true', generateOffWithWrongArgumentsMacro, wrongListenerParameterErrorMessage, 'error', true);
test('with false', generateOffWithWrongArgumentsMacro, wrongListenerParameterErrorMessage, 'error', false);
test('with null', generateOffWithWrongArgumentsMacro, wrongListenerParameterErrorMessage, 'error', null);
test('with undefined', generateOffWithWrongArgumentsMacro, wrongListenerParameterErrorMessage, 'error', undefined);
test('with wrong string', generateOffWithWrongArgumentsMacro, wrongListenerParameterErrorMessage, 'error', 'write');
test('with wrong string 2', generateOffWithWrongArgumentsMacro, wrongListenerParameterErrorMessage, 'error', 'finish');
test('with wrong string 3', generateOffWithWrongArgumentsMacro, wrongListenerParameterErrorMessage, 'error', 'error');
test('with empty string', generateOffWithWrongArgumentsMacro, wrongListenerParameterErrorMessage, 'error', '  	');