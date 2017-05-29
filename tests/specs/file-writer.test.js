'use strict';

const assert = require('assert');
const test = require('ava');

const requireFromIndex = require('../utils/require-from-index');

const createMockDirectory = require('../utils/create-mock-directory');

test('type and api', t => {
	const FileWriter = requireFromIndex('sources/file-writer');

	assert(typeof FileWriter === 'function')

	const classProperties = Object.getOwnPropertyNames(FileWriter.prototype);

	const expectedClassProperties = ['constructor', 'writeTo'];

	expectedClassProperties.forEach(property => assert(classProperties.includes(property), `Expected class property "${property}" unfound`));
	classProperties.forEach(property => assert(expectedClassProperties.includes(property), `Unexpected class property "${property}" found`));
});

test('instanciation using write and methods', t => {
	const FileWriter = requireFromIndex('sources/file-writer');

	const fileWriter = new FileWriter({
		write: 'file-content'
	});

	assert.equal(typeof fileWriter, 'object');
	assert(fileWriter instanceof FileWriter);

	assert.equal(typeof fileWriter.writeTo, 'function');
});

test('instanciation using copy and methods', t => {
	const FileWriter = requireFromIndex('sources/file-writer');

	const fileWriter = new FileWriter({
		copy: 'path/to/copy'
	});

	assert.equal(typeof fileWriter, 'object');
	assert(fileWriter instanceof FileWriter);

	assert.equal(typeof fileWriter.writeTo, 'function');
});

test.skip('writeTo using write', t => {
	const FileWriter = requireFromIndex('sources/file-writer');
});

test.skip('writeTo using copy', t => {
	const FileWriter = requireFromIndex('sources/file-writer');
});

test.skip('writeTo using write and options', t => {
	const FileWriter = requireFromIndex('sources/file-writer');
});

test.skip('writeTo using copy and options', t => {
	const FileWriter = requireFromIndex('sources/file-writer');
});

test.skip('writeTo using write and default options', t => {
	const FileWriter = requireFromIndex('sources/file-writer');
});

test.skip('writeTo using copy and default options', t => {
	const FileWriter = requireFromIndex('sources/file-writer');
});

test.skip('unvalid instanciation', t => {
	const FileWriter = requireFromIndex('sources/file-writer');
});