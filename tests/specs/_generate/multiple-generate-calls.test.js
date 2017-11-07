'use strict';

const test = require('ava');

const sinon = require('sinon');

const requireFromIndex = require('../../utils/require-from-index');

const testDirectoryMacro = require('./test-directory.macro');

const mockGenerateConfigObjectKeyName = require('../../mocks/mock-generate-config-object-key-name');
const mockFileContent = require('../../mocks/mock-file-content');

/*------------------------*/

test.todo('Add variations with eventData option');

test.todo('configKeysCache option using the instance generator - test uniq call with no conflicts - synchronous');
test.todo('configKeysCache option using the instance generator - test uniq call with no conflicts - asynchronous');
test.todo('configKeysCache option using the instance generator - test uniq call with conflicts - synchronous');
test.todo('configKeysCache option using the instance generator - test uniq call with conflicts - asynchronous');

test.todo('configKeysCache option using the generate function - test uniq call with no conflicts - synchronous');
test.todo('configKeysCache option using the generate function - test uniq call with no conflicts - asynchronous');
test.todo('configKeysCache option using the generate function - test uniq call with conflicts - synchronous');
test.todo('configKeysCache option using the generate function - test uniq call with conflicts - asynchronous');

test.todo('configKeysCache option using the generate function after using the instance generator - test uniq call with no conflicts - synchronous');
test.todo('configKeysCache option using the generate function after using the instance generator - test uniq call with no conflicts - asynchronous');
test.todo('configKeysCache option using the generate function after using the instance generator - test uniq call with conflicts - synchronous');
test.todo('configKeysCache option using the generate function after using the instance generator - test uniq call with conflicts - asynchronous');

test.cb.skip('default configKeysCache option - test multiple generate calls with no conflicts - synchronous', testDirectoryMacro, (t, directory) => {
	const generate = requireFromIndex('sources/generate')();

	const filePath1 = mockGenerateConfigObjectKeyName({
		depth: 1,
		absolute: directory.path
	});
	const filePath2 = mockGenerateConfigObjectKeyName({
		depth: 2,
		absolute: directory.path
	});
	const filePath3 = mockGenerateConfigObjectKeyName({
		depth: 3,
		absolute: directory.path
	});
	const filePath4 = mockGenerateConfigObjectKeyName({
		depth: 2,
		absolute: directory.path
	});
	const filePath5 = mockGenerateConfigObjectKeyName({
		depth: 1,
		absolute: directory.path
	});

	const fileContent1 = mockFileContent();
	const fileContent2 = mockFileContent();
	const fileContent3 = mockFileContent();
	const fileContent4 = mockFileContent();
	const fileContent5 = mockFileContent();

	generate({
		[filePath1]: fileContent1,
		[filePath2]: fileContent2
	});

	generate({
		[filePath3]: fileContent3,
		[filePath4]: fileContent4,
		[filePath5]: fileContent5
	});

	generate.on('error', ()=>t.fail());

	const writtenFiles = [];
	generate.on('write', event => {
		t.is(typeof event, 'object');
		t.is(Object.keys(event).length, 2);
		t.is(event.data, undefined);

		t.is(typeof event.filepath, 'string');
		writtenFiles.push(event.filepath);
	});

	generate.on('finish', event => {
		end();
	});

	let endCount = 0;
	function end(){
		endCount++;
		if (endCount === 2) {
			t.is(writtenFiles.length, 5);
			t.true(writtenFiles.includes(filePath1));
			t.true(writtenFiles.includes(filePath2));
			t.true(writtenFiles.includes(filePath3));
			t.true(writtenFiles.includes(filePath4));
			t.true(writtenFiles.includes(filePath5));

			t.end();
		}
	}
});

test.skip('default configKeysCache option - test multiple generate calls with no conflicts - asynchronous', testDirectoryMacro, t => {

});

test.skip('default configKeysCache option - test multiple generate calls with conflicts - synchronous', testDirectoryMacro, t => {

});

test.skip('default configKeysCache option - test multiple generate calls with conflicts - asynchronous', testDirectoryMacro, t => {

});


test.skip('override configKeysCache option using the instance generator - test multiple generate calls with no conflicts - synchronous', testDirectoryMacro, t => {

});

test.skip('override configKeysCache option using the instance generator - test multiple generate calls with no conflicts - asynchronous', testDirectoryMacro, t => {

});

test.skip('override configKeysCache option using the instance generator - test multiple generate calls with conflicts - synchronous', testDirectoryMacro, t => {

});

test.skip('override configKeysCache option using the instance generator - test multiple generate calls with conflicts - asynchronous', testDirectoryMacro, t => {

});


test.skip('override configKeysCache option using the generate function - test multiple generate calls with no conflicts - synchronous', testDirectoryMacro, t => {

});

test.skip('override configKeysCache option using the generate function - test multiple generate calls with no conflicts - asynchronous', testDirectoryMacro, t => {

});

test.skip('override configKeysCache option using the generate function - test multiple generate calls with conflicts - synchronous', testDirectoryMacro, t => {

});

test.skip('override configKeysCache option using the generate function - test multiple generate calls with conflicts - asynchronous', testDirectoryMacro, t => {

});


test.skip('override configKeysCache option using the generate function after using the instance generator - test multiple generate calls with no conflicts - synchronous', testDirectoryMacro, t => {

});

test.skip('override configKeysCache option using the generate function after using the instance generator - test multiple generate calls with no conflicts - asynchronous', testDirectoryMacro, t => {

});

test.skip('override configKeysCache option using the generate function after using the instance generator - test multiple generate calls with conflicts - synchronous', testDirectoryMacro, t => {

});

test.skip('override configKeysCache option using the generate function after using the instance generator - test multiple generate calls with conflicts - asynchronous', testDirectoryMacro, t => {

});