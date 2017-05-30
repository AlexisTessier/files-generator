'use strict';

const assert = require('assert');
const test = require('ava');

const requireFromIndex = require('../utils/require-from-index');

const createMockDirectory = require('../utils/create-mock-directory');

test('type and api', t => {
	const generateFromIndex = requireFromIndex('index');
	const generate = requireFromIndex('sources/generate');

	assert(generateFromIndex === generate);
	assert(typeof generate === 'function');
});

test('generate from an instance of FileWriter', t => {
	const generate = requireFromIndex('sources/generate');
	const FileWriter = requireFromIndex('sources/file-writer');

	t.plan(1);
	return createMockDirectory('generate-from-instance-of-file-writer').then(directory => {
		const generatePromise = generate({
			[directory.join('file-from-file-writer.txt')]: new FileWriter({
				write: 'file-content-from-file-writer'
			})
		});

		assert(generatePromise instanceof Promise);

		return generatePromise.then(()=>{
			return directory.assertAllFilesExist([{
				path: 'file-from-file-writer.txt',
				content: 'file-content-from-file-writer'
			}]).then(()=>{t.pass()})
		})
	});
});

test.skip('generate from an instance of FileWriter - callback style', t => {
});

test.skip('generate from multiple instances of FileWriter', t => {
});

test.skip('generate from multiple instances of FileWriter - callback style', t => {
});

test.skip('generate from an empty object of instance of FileWriter', t => {
});

test.skip('generate from an empty object of instance of FileWriter - callback style', t => {
});