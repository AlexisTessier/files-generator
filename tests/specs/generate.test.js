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

test.skip('generate from an instance of FileWriter', t => {
	const generate = requireFromIndex('sources/generate');

	t.plan(1);
	return createMockDirectory('generate-from-instanceof-file-writer').then(directory => {
		t.pass();


		console.log(directory)
	});
});