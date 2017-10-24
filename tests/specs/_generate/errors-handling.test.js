'use strict';

const test = require('ava');

const msg = require('@alexistessier/msg');

const requireFromIndex = require('../../utils/require-from-index');

const loggable = require('../../utils/loggable');

const mockGenerateConfigObjectKeyName = require('../../mocks/mock-generate-config-object-key-name');
const mockFileContent = require('../../mocks/mock-file-content');
const mockWriteFile = require('../../mocks/mock-write-file');

const generateMockingWriteFileMacro = require('./generate-mocking-write-file.macro');

/*-------------------------*/

test('throw error if cwd using the instance generator is not an absolute path', t => {
	const cwd = 'cwd/relative/override';

	const cwdRelativeError = t.throws(()=>{
		const generate = requireFromIndex('sources/generate')({cwd});
	});

	t.is(cwdRelativeError.message, `You must provide an absolute cwd path. "${cwd}" is a relative one.`)
});

test('throw error if cwd using the generate function is not an absolute path', t => {
	const cwd = 'cwd/relative/override';

	const writeFile = mockWriteFile();
	const generate = requireFromIndex('sources/generate')();

	const filePath = mockGenerateConfigObjectKeyName();
	const fileContent = mockFileContent();

	const cwdRelativeError = t.throws(()=>{
		generate({
			[filePath]: fileContent
		}, {
			cwd,
			writeFile
		});
	});

	t.is(cwdRelativeError.message, `You must provide an absolute cwd path. "${cwd}" is a relative one.`)
});

test('throw error if cwd using generate.use() is not an absolute path', t => {
	const cwd = 'cwd/relative/override';

	const writeFile = mockWriteFile();
	const generate = requireFromIndex('sources/generate')();

	const filePath = mockGenerateConfigObjectKeyName();
	const fileContent = mockFileContent();

	const cwdRelativeError = t.throws(()=>{
		generate({
			[filePath]: generate.use(fileContent, {cwd})
		});
	});

	t.is(cwdRelativeError.message, `You must provide an absolute cwd path. "${cwd}" is a relative one.`)
});

/*------------------------*/

function encodingNotStringErrorUsingInstanceGeneratorMacro(t, unvalidEncoding){
	const unvalidEncodingError = t.throws(()=>{
		const generate = requireFromIndex('sources/generate')({
			encoding: unvalidEncoding
		});
	});
}

encodingNotStringErrorUsingInstanceGeneratorMacro.title = (providedTitle, unvalidEncoding) => (
	`${providedTitle} - throw error if encoding using the instance generator is not a string but ${loggable(unvalidEncoding)}`
);

function encodingNotStringErrorUsingTheGenerateFunctionMacro(t, unvalidEncoding){
	const generate = requireFromIndex('sources/generate')();

	const filePath = mockGenerateConfigObjectKeyName();
	const fileContent = mockFileContent();

	const unvalidEncodingError = t.throws(()=>{
		generate({
			[filePath]: fileContent
		}, {
			encoding: unvalidEncoding,
			cwd: '/cwd/absolute/override',
			writeFile: mockWriteFile()
		});
	});
}

encodingNotStringErrorUsingTheGenerateFunctionMacro.title = (providedTitle, unvalidEncoding) => (
	`${providedTitle} - throw error if encoding using the generate function is not a string but ${loggable(unvalidEncoding)}`
);

function encodingNotStringErrorUsingUseFunctionMacro(t, unvalidEncoding){
	const generate = requireFromIndex('sources/generate')();

	const writeFile = mockWriteFile();
	const filePath = mockGenerateConfigObjectKeyName();
	const fileContent = mockFileContent();

	const unvalidEncodingError = t.throws(()=>{
		generate({
			[filePath]: generate.use(fileContent, {
				encoding: unvalidEncoding,
				cwd: '/cwd/absolute/override',
				writeFile: mockWriteFile()
			})
		});
	});
}

encodingNotStringErrorUsingUseFunctionMacro.title = (providedTitle, unvalidEncoding) => (
	`${providedTitle} - throw error if encoding using generate.use() is not a string but ${loggable(unvalidEncoding)}`
);

test(encodingNotStringErrorUsingInstanceGeneratorMacro, false);
test(encodingNotStringErrorUsingInstanceGeneratorMacro, '');
test(encodingNotStringErrorUsingInstanceGeneratorMacro, null);
test(encodingNotStringErrorUsingInstanceGeneratorMacro, Symbol());
test(encodingNotStringErrorUsingInstanceGeneratorMacro, ()=>{return;});
test(encodingNotStringErrorUsingInstanceGeneratorMacro, []);
test(encodingNotStringErrorUsingInstanceGeneratorMacro, ['hjsfd', 'g']);
test(encodingNotStringErrorUsingInstanceGeneratorMacro, true);
test(encodingNotStringErrorUsingInstanceGeneratorMacro, {});

test(encodingNotStringErrorUsingTheGenerateFunctionMacro, false);
test(encodingNotStringErrorUsingTheGenerateFunctionMacro, '');
test(encodingNotStringErrorUsingTheGenerateFunctionMacro, null);
test(encodingNotStringErrorUsingTheGenerateFunctionMacro, Symbol());
test(encodingNotStringErrorUsingTheGenerateFunctionMacro, ()=>{return;});
test(encodingNotStringErrorUsingTheGenerateFunctionMacro, []);
test(encodingNotStringErrorUsingTheGenerateFunctionMacro, ['hjsfd', 'g']);
test(encodingNotStringErrorUsingTheGenerateFunctionMacro, true);
test(encodingNotStringErrorUsingTheGenerateFunctionMacro, {});

test(encodingNotStringErrorUsingUseFunctionMacro, false);
test(encodingNotStringErrorUsingUseFunctionMacro, '');
test(encodingNotStringErrorUsingUseFunctionMacro, null);
test(encodingNotStringErrorUsingUseFunctionMacro, Symbol());
test(encodingNotStringErrorUsingUseFunctionMacro, ()=>{return;});
test(encodingNotStringErrorUsingUseFunctionMacro, []);
test(encodingNotStringErrorUsingUseFunctionMacro, ['hjsfd', 'g']);
test(encodingNotStringErrorUsingUseFunctionMacro, true);
test(encodingNotStringErrorUsingUseFunctionMacro, {});

/*-------------------------*/

test('generate.use() simple string as content - trying to override eventData must cause error', generateMockingWriteFileMacro, (t, writeFile, generate) => {
	const filePath1 = mockGenerateConfigObjectKeyName({ absolute:'/' });
	const fileContent1 = mockFileContent();

	const tryingToOverrideEventDataFromGenerateUseError = t.throws(() => {
		generate({
			[filePath1]: generate.use(fileContent1, {eventData: 'data as string'})
		});
	});

	t.is(tryingToOverrideEventDataFromGenerateUseError.message, msg(
		`You are trying to use generate.use function in order to override`,
		`the eventData option with the value data as string (string).`,
		`This will not work. It's not possible.`
	));
});

test('generate.use() simple string as content - trying to override eventData even with undefined must cause error', generateMockingWriteFileMacro, (t, writeFile, generate) => {
	const filePath1 = mockGenerateConfigObjectKeyName({ absolute:'/' });
	const fileContent1 = mockFileContent();

	const tryingToOverrideEventDataFromGenerateUseError = t.throws(() => {
		generate({
			[filePath1]: generate.use(fileContent1, {eventData: undefined})
		});
	});

	t.is(tryingToOverrideEventDataFromGenerateUseError.message, msg(
		`You are trying to use generate.use function in order to override`,
		`the eventData option with the value undefined (undefined).`,
		`This will not work. It's not possible.`
	));
});

test.todo('handle wrong args types');
test.todo('remove better-assert');