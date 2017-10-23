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

test('generate.use() type', t => {
	const g = requireFromIndex('sources/generate');

	t.is(g.use, undefined);

	const generate = g();

	t.is(typeof generate.use, 'function');
});

/*---------------------------*/

test('Basic usage', featureHasTestFileMacro, 'basic-usage');
test('Event subscription', featureHasTestFileMacro, 'event-subscription');
test('Options and options overrides usage', featureHasTestFileMacro, 'options-usage');
test('Errors handling', featureHasTestFileMacro, 'errors-handling');

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