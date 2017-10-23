'use strict';

const test = require('ava');

const fs = require('fs');
const path = require('path');

const requireFromIndex = require('../utils/require-from-index');

function featureHasTestFileMacro(t, testFilename) {
	t.plan(1);

	return new Promise(resolve => {
		fs.access(path.join(__dirname, '_generate', `${testFilename}.test.js`), err => {
			if (err) {t.fail(`The feature should be tested in a specific file. "${testFilename}" wasn't found (${err.message})`);}
			t.pass();
			resolve();
		});
	});
}

featureHasTestFileMacro.title = providedTitle => (
	`Feature has a test file - ${providedTitle}`
);

/*---------------------------*/

test('type and api', t => {
	const generateFromIndex = requireFromIndex('index');
	const generate = requireFromIndex('sources/generate');

	t.is(generateFromIndex, generate);
	t.is(typeof generate, 'function');
});

/*---------------------------*/

test('Basic usage', featureHasTestFileMacro, 'basic-usage');
test('Event subscription', featureHasTestFileMacro, 'event-subscription');