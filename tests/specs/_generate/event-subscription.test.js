'use strict';

const test = require('ava');

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