'use strict';

const assert = require('assert');
const test = require('ava');

const fs = require('fs');
const path = require('path');

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
		copy: path.join(__dirname, 'path/to/copy')
	});

	assert.equal(typeof fileWriter, 'object');
	assert(fileWriter instanceof FileWriter);

	assert.equal(typeof fileWriter.writeTo, 'function');
});

test('instanciation using copy with a non absolute path', t => {
	const FileWriter = requireFromIndex('sources/file-writer');

	t.throws(()=>{
		new FileWriter({
			copy: 'path/to/copy'
		});
	});
});

test('writeTo using write', t => {
	const FileWriter = requireFromIndex('sources/file-writer');

	const writer = new FileWriter({write: 'file-content'})

	t.plan(1);
	return createMockDirectory('write-to-using-write').then(directory => {
		const writeToPromise = writer.writeTo(directory.join('file-name.txt'));

		assert(writeToPromise instanceof Promise);

		return writeToPromise.then(()=>{
			return directory.assertAllFilesExist([{
				path: 'file-name.txt',
				content: 'file-content'
			}]).then(()=>{t.pass()})
		});
	});
});

test.cb('writeTo using write - callback style', t => {
	const FileWriter = requireFromIndex('sources/file-writer');

	const writer = new FileWriter({write: 'file-content'});

	t.plan(1);
	createMockDirectory('write-to-using-write-callback-style').then(directory => {
		const writeToResult = writer.writeTo(directory.join('file-name.txt'), err => {
			assert(!err);

			directory.assertAllFilesExist([{
				path: 'file-name.txt',
				content: 'file-content'
			}]).then(()=>{t.pass();t.end()})
		});

		assert.equal(writeToResult, null);
	});
});

test('writeTo using write with a Buffer', t => {
	const FileWriter = requireFromIndex('sources/file-writer');

	const writer = new FileWriter({write: Buffer.from('buffer-file-content')})

	t.plan(1);
	return createMockDirectory('write-to-using-write-with-a-buffer').then(directory => {
		const writeToPromise = writer.writeTo(directory.join('buffer-file-name.txt'));

		assert(writeToPromise instanceof Promise);

		return writeToPromise.then(()=>{
			return directory.assertAllFilesExist([{
				path: 'buffer-file-name.txt',
				content: 'buffer-file-content'
			}]).then(()=>{t.pass()})
		});
	});
});

test.cb('writeTo using write with a Buffer - callback style', t => {
	const FileWriter = requireFromIndex('sources/file-writer');

	const writer = new FileWriter({write: Buffer.from('buffer-file-content')})

	t.plan(1);
	createMockDirectory('write-to-using-write-with-a-buffer-callback-style').then(directory => {
		const writeToResult = writer.writeTo(directory.join('buffer-file-name.txt'), err => {
			assert(!err);

			directory.assertAllFilesExist([{
				path: 'buffer-file-name.txt',
				content: 'buffer-file-content'
			}]).then(()=>{t.pass();t.end()})
		});

		assert.equal(writeToResult, null);
	});
});

test('writeTo using write with a Stream', t => {
	const FileWriter = requireFromIndex('sources/file-writer');

	const writer = new FileWriter({
		write: fs.createReadStream(path.join(__dirname, '../mocks/write-to-using-write-with-a-stream.txt'))
	});

	t.plan(1);
	return createMockDirectory('write-to-using-write-with-a-stream').then(directory => {
		const writeToPromise = writer.writeTo(directory.join('stream-file-name.txt'));

		assert(writeToPromise instanceof Promise);

		return writeToPromise.then(()=>{
			return directory.assertAllFilesExist([{
				path: 'stream-file-name.txt',
				content: 'write-to-using-write-with-a-stream-file-content'
			}]).then(()=>{t.pass()})
		});
	});
});

test.cb('writeTo using write with a Stream - callback style', t => {
	const FileWriter = requireFromIndex('sources/file-writer');

	const writer = new FileWriter({
		write: fs.createReadStream(path.join(__dirname, '../mocks/write-to-using-write-with-a-stream.txt'))
	});

	t.plan(1);
	createMockDirectory('write-to-using-write-with-a-stream-callback-style').then(directory => {
		const writeToResult = writer.writeTo(directory.join('stream-file-name.txt'), err => {
			assert(!err);

			directory.assertAllFilesExist([{
				path: 'stream-file-name.txt',
				content: 'write-to-using-write-with-a-stream-file-content'
			}]).then(()=>{t.pass();t.end()})
		});

		assert.equal(writeToResult, null);
	});
});

test('writeTo using write with a Promise resolving a string', t => {
	const FileWriter = requireFromIndex('sources/file-writer');

	const writer = new FileWriter({
		write: new Promise(resolve => setTimeout(()=>resolve('file-content-from-promise'), 50))
	});

	t.plan(1);
	return createMockDirectory('write-to-using-write-with-a-promise-resolving-a-string').then(directory => {
		const writeToPromise = writer.writeTo(directory.join('string-from-promise-file-name.txt'));

		assert(writeToPromise instanceof Promise);

		return writeToPromise.then(()=>{
			return directory.assertAllFilesExist([{
				path: 'string-from-promise-file-name.txt',
				content: 'file-content-from-promise'
			}]).then(()=>{t.pass()})
		});
	});
});

test.cb('writeTo using write with a Promise resolving a string - callback style', t => {
	const FileWriter = requireFromIndex('sources/file-writer');

	const writer = new FileWriter({
		write: new Promise(resolve => setTimeout(()=>resolve('file-content-from-promise-callback-style'), 50))
	});

	t.plan(1);
	createMockDirectory('write-to-using-write-with-a-promise-resolving-a-string-callback-style').then(directory => {
		const writeToResult = writer.writeTo(directory.join('string-from-promise-callback-style-file-name.txt'), err => {
			assert(!err);

			directory.assertAllFilesExist([{
				path: 'string-from-promise-callback-style-file-name.txt',
				content: 'file-content-from-promise-callback-style'
			}]).then(()=>{t.pass();t.end()})
		});

		assert.equal(writeToResult, null);
	});
});

test('writeTo using write with a Promise resolving a buffer', t => {
	const FileWriter = requireFromIndex('sources/file-writer');

	const writer = new FileWriter({
		write: new Promise(resolve => setTimeout(()=>resolve(Buffer.from('file-content-from-promise-resolving-buffer')), 50))
	});

	t.plan(1);
	return createMockDirectory('write-to-using-write-with-a-promise-resolving-a-buffer').then(directory => {
		const writeToPromise = writer.writeTo(directory.join('buffer-from-promise-file-name.txt'));

		assert(writeToPromise instanceof Promise);

		return writeToPromise.then(()=>{
			return directory.assertAllFilesExist([{
				path: 'buffer-from-promise-file-name.txt',
				content: 'file-content-from-promise-resolving-buffer'
			}]).then(()=>{t.pass()})
		});
	});
});

test.cb('writeTo using write with a Promise resolving a buffer - callback style', t => {
	const FileWriter = requireFromIndex('sources/file-writer');

	const writer = new FileWriter({
		write: new Promise(resolve => setTimeout(()=>resolve(Buffer.from('file-content-from-promise-resolving-buffer-callback-style')), 50))
	});

	t.plan(1);
	createMockDirectory('write-to-using-write-with-a-promise-resolving-a-buffer-callback-style').then(directory => {
		const writeToResult = writer.writeTo(directory.join('buffer-from-promise-callback-style-file-name.txt'), err => {
			assert(!err);

			directory.assertAllFilesExist([{
				path: 'buffer-from-promise-callback-style-file-name.txt',
				content: 'file-content-from-promise-resolving-buffer-callback-style'
			}]).then(()=>{t.pass();t.end()})
		});

		assert.equal(writeToResult, null);
	});
});

test('writeTo using write with a Promise resolving a stream', t => {
	const FileWriter = requireFromIndex('sources/file-writer');

	const writer = new FileWriter({
		write: new Promise(resolve => setTimeout(()=>resolve(
			fs.createReadStream(path.join(__dirname, '../mocks/write-to-using-write-with-a-stream-from-promise.txt'))
		), 50))
	});

	t.plan(1);
	return createMockDirectory('write-to-using-write-with-a-promise-resolving-a-stream').then(directory => {
		const writeToPromise = writer.writeTo(directory.join('stream-from-promise-file-name.txt'));

		assert(writeToPromise instanceof Promise);

		return writeToPromise.then(()=>{
			return directory.assertAllFilesExist([{
				path: 'stream-from-promise-file-name.txt',
				content: 'write-to-using-write-with-a-stream-from-promise-file-content'
			}]).then(()=>{t.pass()})
		});
	});
});

test.cb('writeTo using write with a Promise resolving a stream - callback style', t => {
	const FileWriter = requireFromIndex('sources/file-writer');

	const writer = new FileWriter({
		write: new Promise(resolve => setTimeout(()=>resolve(
			fs.createReadStream(path.join(__dirname, '../mocks/write-to-using-write-with-a-stream-from-promise.txt'))
		), 50))
	});

	t.plan(1);
	createMockDirectory('write-to-using-write-with-a-promise-resolving-a-stream-callback-style').then(directory => {
		const writeToResult = writer.writeTo(directory.join('stream-from-promise-callback-style-file-name.txt'), err => {
			assert(!err);

			directory.assertAllFilesExist([{
				path: 'stream-from-promise-callback-style-file-name.txt',
				content: 'write-to-using-write-with-a-stream-from-promise-file-content'
			}]).then(()=>{t.pass();t.end()})
		});

		assert.equal(writeToResult, null);
	});
});

test('writeTo using write with a failing Promise', t => {
	const FileWriter = requireFromIndex('sources/file-writer');

	const writer = new FileWriter({
		write: new Promise((resolve, reject) => setTimeout(()=>reject(new Error('promise error')), 50))
	});

	t.plan(1);
	return createMockDirectory('write-to-using-write-with-a-failing-promise', 'must-be-preserved').then(directory => {
		const writeToPromise = writer.writeTo(directory.join('must-be-preserved.txt'));

		assert(writeToPromise instanceof Promise);

		return writeToPromise.then(()=>t.fail()).catch(err=>{
			assert.equal(err.message, `Error getting the content of "${directory.join('must-be-preserved.txt')}" => promise error`);

			return directory.assertAllFilesExist([{
				path: 'must-be-preserved.txt',
				content: 'must-be-preserved'
			}]).then(()=>{t.pass();})
		});
	});
});

test.skip('writeTo using write with a failing Promise - callback style', t => {
	const FileWriter = requireFromIndex('sources/file-writer');

	const writer = new FileWriter({
		write: new Promise(resolve )
	})
});

test.skip('writeTo using write with a Promise resolving a Promise', t => {
	const FileWriter = requireFromIndex('sources/file-writer');

	const writer = new FileWriter({
		write: new Promise(resolve )
	})
});

test.skip('writeTo using write with a Promise resolving a Promise - callback style', t => {
	const FileWriter = requireFromIndex('sources/file-writer');

	const writer = new FileWriter({
		write: new Promise(resolve )
	})
});

test.skip('writeTo using write with a Promise resolving a function', t => {
	const FileWriter = requireFromIndex('sources/file-writer');

	const writer = new FileWriter({
		write: new Promise(resolve )
	})
});

test.skip('writeTo using write with a Promise resolving a function - callback style', t => {
	const FileWriter = requireFromIndex('sources/file-writer');

	const writer = new FileWriter({
		write: new Promise(resolve )
	})
});

test.skip('writeTo using write with a function and string', t => {
	const FileWriter = requireFromIndex('sources/file-writer');
});

test.skip('writeTo using write with a function and string - callback style', t => {
	const FileWriter = requireFromIndex('sources/file-writer');
});

test.skip('writeTo using write with a function and buffer', t => {
	const FileWriter = requireFromIndex('sources/file-writer');
});

test.skip('writeTo using write with a function and buffer - callback style', t => {
	const FileWriter = requireFromIndex('sources/file-writer');
});

test.skip('writeTo using write with a function and stream', t => {
	const FileWriter = requireFromIndex('sources/file-writer');
});

test.skip('writeTo using write with a function and stream - callback style', t => {
	const FileWriter = requireFromIndex('sources/file-writer');
});

test.skip('writeTo using write with a function and error', t => {
	const FileWriter = requireFromIndex('sources/file-writer');
});

test.skip('writeTo using write with a function and error - callback style', t => {
	const FileWriter = requireFromIndex('sources/file-writer');
});

test.skip('writeTo using write with a function and Promise', t => {
	const FileWriter = requireFromIndex('sources/file-writer');
});

test.skip('writeTo using write with a function and Promise - callback style', t => {
	const FileWriter = requireFromIndex('sources/file-writer');
});

test.skip('writeTo using write with a function and function', t => {
	const FileWriter = requireFromIndex('sources/file-writer');
});

test.skip('writeTo using write with a function and function - callback style', t => {
	const FileWriter = requireFromIndex('sources/file-writer');
});

test.skip('writeTo using copy', t => {
	const FileWriter = requireFromIndex('sources/file-writer');
});

test.skip('writeTo using copy - callback style', t => {
	const FileWriter = requireFromIndex('sources/file-writer');
});

test.skip('writeTo using copy with a Promise resolving a string', t => {
	const FileWriter = requireFromIndex('sources/file-writer');
});

test.skip('writeTo using copy with a Promise resolving a string - callback style', t => {
	const FileWriter = requireFromIndex('sources/file-writer');
});

test.skip('writeTo using copy with a Promise resolving a Promise', t => {
	const FileWriter = requireFromIndex('sources/file-writer');
});

test.skip('writeTo using copy with a Promise resolving a Promise - callback style', t => {
	const FileWriter = requireFromIndex('sources/file-writer');
});

test.skip('writeTo using copy with a Promise resolving a function', t => {
	const FileWriter = requireFromIndex('sources/file-writer');
});

test.skip('writeTo using copy with a Promise resolving a function - callback style', t => {
	const FileWriter = requireFromIndex('sources/file-writer');
});

test.skip('writeTo using copy with a function', t => {
	const FileWriter = requireFromIndex('sources/file-writer');
});

test.skip('writeTo using copy with a function - callback style', t => {
	const FileWriter = requireFromIndex('sources/file-writer');
});

test.skip('writeTo using copy with a function and Promise', t => {
	const FileWriter = requireFromIndex('sources/file-writer');
});

test.skip('writeTo using copy with a function and Promise - callback style', t => {
	const FileWriter = requireFromIndex('sources/file-writer');
});

test.skip('writeTo using copy with a function and function', t => {
	const FileWriter = requireFromIndex('sources/file-writer');
});

test.skip('writeTo using copy with a function and function - callback style', t => {
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

test.skip('writeTo using a non absolute path', t => {
	const FileWriter = requireFromIndex('sources/file-writer');
});

test.skip('writeTo using a non existent path', t => {
	const FileWriter = requireFromIndex('sources/file-writer');
});

test.skip('writeTo using a non existent path - callback style', t => {
	const FileWriter = requireFromIndex('sources/file-writer');
});

test.skip('unvalid instanciation', t => {
	const FileWriter = requireFromIndex('sources/file-writer');
});
