'use strict';

const test = require('ava');

const requireFromIndex = require('../../utils/require-from-index');

test('create new generate function', t => {
	const generate = requireFromIndex('sources/generate')();

	t.is(typeof generate, 'function');
});

test('generate instance function returns null', t => {
	const generate = requireFromIndex('sources/generate')();

	const generateResult = generate();

	t.is(generateResult, undefined);
});