'use strict';

const path = require('path');

const assert = require('assert');
const test = require('ava');

const requireFromIndex = require('../utils/require-from-index');

test('type and api', t => {
	const generateFromIndex = requireFromIndex('index');
	const generate = requireFromIndex('sources/generate');

	assert(generateFromIndex === generate);
	assert(typeof generate === 'function');
});

function generatePromiseStyleMacro(t) {
	// body...
}
//generatePromiseStyleMacro.title = (providedTitle, info) => `${providedTitle} - promise style`

function generateCallbackStyleMacro(t) {
	// body...
}
//generateCallbackStyleMacro.title = (providedTitle, info) => `${providedTitle} - callback style`

const generatePromiseAndCallbackStyleMacro = [generatePromiseStyleMacro, generateCallbackStyleMacro];