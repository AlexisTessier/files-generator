'use strict';

const assert = require('assert');
const test = require('ava');

const path = require('path');

const stream = require('stream');
const WritableStream = stream.Writable;
const ReadableStream = stream.Readable;

const dashify = require('dashify');

const requireFromIndex = require('../utils/require-from-index');

const writeToBefore = require('../utils/write-to-before');
const createTestDirectory = require('../utils/create-test-directory');
const mockFileWriterOptionsObject = require('../mocks/mock-file-writer-options-object');

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

// Unvalid instanciation
[[{
	write : null
}], [{
	copy : null
}], [{
	write : 'file-content',
	copy: 'file-path'
}], [
	null
], [function () {}
], [
	5
], [
	'string'
], [{
	write: 6
}], [{
	copy: 6
}]].forEach(unvalidArguments => {
	test(`unvalid instanciation - new FileWriter(...${JSON.stringify(unvalidArguments)})`, t => {
		const FileWriter = requireFromIndex('sources/file-writer');

		t.throws(()=>{
			new FileWriter(...unvalidArguments);
		});
	});
});

/*-------------------------------------------------*/
/*-------------------------------------------------*/
/*-------------------------------------------------*/

function writeToPromiseStyleMacro(t, testVariant){
	writeToBefore(t, testVariant, ({
		writerConfig,
		writeToDest,
		writeToDependencies,
		expectedErrorMessage,
		assertAllFilesExist
	}) => {
		const FileWriter = requireFromIndex('sources/file-writer');

		const writer = new FileWriter(writerConfig);

		const writeToPromise = writer.writeTo(writeToDest, null, writeToDependencies);

		assert(writeToPromise instanceof Promise);

		if(expectedErrorMessage){
			writeToPromise.then(()=>{t.fail();}).catch(err => {
				assert.equal(err.message, expectedErrorMessage);

				assertAllFilesExist(()=>{t.pass();t.end();});
			});
		}
		else{
			writeToPromise.then(()=>{
				assertAllFilesExist(()=>{t.pass();t.end();})
			}).catch(err => {assert(!err, `${t.title} shouldn't throw error => ${err ? err.message : ''}`)});
		}
	});
}
writeToPromiseStyleMacro.title = (providedTitle, info) => (
	`${providedTitle} - .writeTo() using ${info.write ? 'write' : 'copy'} with a ${info.write || info.copy} - promise style`
);

function writeToCallbackStyleMacro(t, testVariant){
	writeToBefore(t, testVariant, ({
		writerConfig,
		writeToDest,
		writeToDependencies,
		expectedErrorMessage,
		assertAllFilesExist
	}) => {
		const FileWriter = requireFromIndex('sources/file-writer');

		const writer = new FileWriter(writerConfig);

		const writeToResult = writer.writeTo(writeToDest, err => {
			if(expectedErrorMessage){
				assert.equal(err.message, expectedErrorMessage);
			}
			else{
				assert(!err, `${t.title} shouldn't throw error => ${err ? err.message : ''}`);
			}

			assertAllFilesExist(()=>{t.pass();t.end()})
		}, writeToDependencies);

		assert.equal(writeToResult, null);
	});
}
writeToCallbackStyleMacro.title = (providedTitle, info) => (
	`${providedTitle} - .writeTo() using ${info.write ? 'write' : 'copy'} with a ${info.write || info.copy} - callback style`
);

const writeToPromiseAndCallbackStyleMacro = [writeToPromiseStyleMacro, writeToCallbackStyleMacro];

/*-------------------------------------------------*/
/*-------------------------------------------------*/
/*-------------------------------------------------*/

const writerPossibilities = [
	{ write: 'string' },
	{ write: 'buffer' },
	{ write: 'stream' },
	{ write: 'directory' },
	{ write: 'promise resolving string' },
	{ write: 'promise resolving buffer' },
	{ write: 'promise resolving stream' },
	{ write: 'promise resolving directory' },
	{ write: 'promise resolving function resolving string' },
	{ write: 'promise resolving function resolving buffer' },
	{ write: 'promise resolving function resolving stream' },
	{ write: 'promise resolving function resolving directory' },
	{ write: 'promise resolving promise resolving string' },
	{ write: 'promise resolving promise resolving buffer' },
	{ write: 'promise resolving promise resolving stream' },
	{ write: 'promise resolving promise resolving directory' },
	{ write: 'promise resolving promise resolving function resolving string' },
	{ write: 'promise resolving promise resolving function resolving buffer' },
	{ write: 'promise resolving promise resolving function resolving stream' },
	{ write: 'promise resolving promise resolving function resolving directory' },
	{ write: 'function resolving string' },
	{ write: 'function resolving buffer' },
	{ write: 'function resolving stream' },
	{ write: 'function resolving directory' },
	{ write: 'function resolving promise resolving string' },
	{ write: 'function resolving promise resolving buffer' },
	{ write: 'function resolving promise resolving stream' },
	{ write: 'function resolving promise resolving directory' },
	{ write: 'function resolving function resolving string' },
	{ write: 'function resolving function resolving buffer' },
	{ write: 'function resolving function resolving stream' },
	{ write: 'function resolving function resolving directory' },
	{ write: 'function resolving promise resolving function resolving string' },
	{ write: 'function resolving promise resolving function resolving buffer' },
	{ write: 'function resolving promise resolving function resolving stream' },
	{ write: 'function resolving promise resolving function resolving directory' },
	{ copy: 'absolute path' },
	{ copy: 'relative path' },
	{ copy: 'absolute directory' },
	{ copy: 'relative directory' },
	{ copy: 'promise resolving absolute path' },
	{ copy: 'promise resolving relative path' },
	{ copy: 'promise resolving absolute directory' },
	{ copy: 'promise resolving relative directory' },
	{ copy: 'promise resolving function resolving absolute path' },
	{ copy: 'promise resolving function resolving relative path' },
	{ copy: 'promise resolving function resolving absolute directory' },
	{ copy: 'promise resolving function resolving relative directory' },
	{ copy: 'promise resolving promise resolving absolute path' },
	{ copy: 'promise resolving promise resolving relative path' },
	{ copy: 'promise resolving promise resolving absolute directory' },
	{ copy: 'promise resolving promise resolving relative directory' },
	{ copy: 'function resolving absolute path' },
	{ copy: 'function resolving relative path' },
	{ copy: 'function resolving absolute directory' },
	{ copy: 'function resolving relative directory' },
	{ copy: 'function resolving promise resolving absolute path' },
	{ copy: 'function resolving promise resolving relative path' },
	{ copy: 'function resolving promise resolving absolute directory' },
	{ copy: 'function resolving promise resolving relative directory' },
	{ copy: 'function resolving function resolving absolute path' },
	{ copy: 'function resolving function resolving relative path' },
	{ copy: 'function resolving function resolving absolute directory' },
	{ copy: 'function resolving function resolving relative directory' }
];

writerPossibilities.forEach(possibility => {
	function p(...args) {
		return Object.assign({}, possibility, ...args)
	}

	test.cb(writeToPromiseAndCallbackStyleMacro, p({
		expectFileWasCreated: true
	}));

	test.cb('writeTo a non existent path', writeToPromiseAndCallbackStyleMacro, p({
		writeToPath: 'unexistent/path/to/file.txt',
		expectFileWasCreated: true
	}));

	test.cb('writeTo a relative path', writeToPromiseAndCallbackStyleMacro, p({
		writeToRelativePath: 'relative/path/to/file.txt',
		expectFileWasCreated: true
	}));

	test.cb('writeTo a relative path with a custom cwd', writeToPromiseAndCallbackStyleMacro, p({
		writeToRelativePath: 'relative/path/to/file.txt',
		expectFileWasCreated: true,
		writeToDependencies: {
			cwd: true
		}
	}));
})

/*-------------------------------------------------*/
/*-------------------------------------------------*/
/*-------------------------------------------------*/

function writeToDependencyOptionsMacro(t, {
	write,
	copy,
	dependency,
	defaultOptions,
	expectedOptions,
	callbackStyle
}) {
	expectedOptions = (defaultOptions ? defaultOptions : expectedOptions)[dependency];

	const expectedFile = '/absolute/file/path.txt';
	const expectedContent = 'expected file content';

	t.plan(2);

	mockFileWriterOptionsObject({write, copy}, expectedContent, coreTest);

	function coreTest(config, expectedPathToCopy){
		const FileWriter = requireFromIndex('sources/file-writer');
		const fileWriter = new FileWriter(Object.assign({}, (defaultOptions ? {} : expectedOptions), config));

		const dependenciesMocks = {
			fs: {
				mkdir(dirPath, mode, cb){cb()},
				stat(destPath, cb){cb()},
				writeFile(passedFile, passedContent, passedOptions, cb){
					if (dependency === 'fs.writeFile') {
						assert.equal(passedFile, expectedFile);
						assert.equal(passedContent, expectedContent);
						assert.deepEqual(passedOptions, expectedOptions);

						t.pass();
					}
					
					cb();
				},
				createReadStream(passedPathToCopy, passedOptions){
					let stop = false;
					return new ReadableStream({
						read(){
							if (dependency === 'fs.createReadStream' && !stop) {
								assert.equal(passedPathToCopy, expectedPathToCopy);
								assert.deepEqual(passedOptions, expectedOptions);

								t.pass();
							}

							this.push(stop ? null : expectedContent);
							stop = true;
						}
					});
				},
				createWriteStream(passedFile, passedOptions){
					return new WritableStream({
						write (chunk, encoding, cb) {
							const passedContent = chunk.toString('utf-8');

							if (dependency === 'fs.createWriteStream') {
								assert.equal(passedFile, expectedFile);
								assert.equal(passedContent, expectedContent);
								assert.deepEqual(passedOptions, expectedOptions);
								
								t.pass();
							}
							cb();
						}
					});
				}
			}
		};

		if (callbackStyle) {
			fileWriter.writeTo(expectedFile, ()=>{
				t.pass();t.end();
			}, dependenciesMocks);
		}
		else{
			fileWriter.writeTo(expectedFile, null, dependenciesMocks).then(()=>{
				t.pass();t.end();
			});
		}
	}
}
writeToDependencyOptionsMacro.title = (providedTitle, {write, copy, dependency, defaultOptions, callbackStyle}) => {
	const use = write ? 'write' : 'copy';
	const options = defaultOptions ? 'default options' : 'options';
	const style = callbackStyle ? 'callback' : 'promise';

	return `${providedTitle} - .writeTo() using ${use} with a ${write || copy} - dependency ${dependency} ${options} - ${style} style`
};

writerPossibilities.forEach(function setPossibilityDependencies(possibility){
	const action = (possibility.write || possibility.copy);
	const exploded = action.split(' ');
	const last = exploded[exploded.length - 1];

	if (last === 'string' || last === 'buffer') {
		possibility.dependencies = ['fs.writeFile'];
	}

	if (last === 'stream') {
		possibility.dependencies = ['fs.createWriteStream'];
	}

	if (last === 'path') {
		possibility.dependencies = ['fs.createReadStream', 'fs.createWriteStream'];
	}

	if (last === 'directory') {
		possibility.dependencies = [];
	}
});

writerPossibilities.forEach(({
	write = null,
	copy = null,
	dependencies,
}) => {
	assert(Array.isArray(dependencies), `Please provide the dependencies for the possibility "${write || copy}"`);

	dependencies.forEach(dependency => {
		test.cb(writeToDependencyOptionsMacro, {
			write,
			copy,
			dependency,
			expectedOptions: {
				'fs.writeFile': {
					encoding: 'write-file-encoding'
				},
				'fs.createWriteStream': {
					encoding: 'create-write-stream-encoding'
				},
				'fs.createReadStream': {
					encoding: 'create-read-stream-encoding'
				}
			}
		});

		test.cb(writeToDependencyOptionsMacro, {
			write,
			copy,
			dependency,
			defaultOptions: {
				'fs.writeFile': {
					encoding: 'utf-8'
				},
				'fs.createWriteStream': {
					encoding: 'utf-8'
				},
				'fs.createReadStream': {
					encoding: 'utf-8'
				}
			}
		});

		test.cb(writeToDependencyOptionsMacro, {
			write,
			copy,
			dependency,
			callbackStyle: true,
			expectedOptions: {
				'fs.writeFile': {
					encoding: 'write-file-encoding'
				},
				'fs.createWriteStream': {
					encoding: 'create-write-stream-encoding'
				},
				'fs.createReadStream': {
					encoding: 'create-read-stream-encoding'
				}
			}
		});

		test.cb(writeToDependencyOptionsMacro, {
			write,
			copy,
			dependency,
			callbackStyle: true,
			defaultOptions: {
				'fs.writeFile': {
					encoding: 'utf-8'
				},
				'fs.createWriteStream': {
					encoding: 'utf-8'
				},
				'fs.createReadStream': {
					encoding: 'utf-8'
				}
			}
		});
	});
});

/*-------------------------------------------------*/
/*-------------------------------------------------*/
/*-------------------------------------------------*/

function getThrowingErrorDependency(dep) {
	const deps = {
		mkdirp(dir, opts, cb){
			cb(new Error('mkdirp dependency error'));
		},
		isDirectory(dir, cb){
			cb(new Error('isDirectory dependency error'));
		}
	};

	return {
		[dep]: deps[dep]
	};
}

writerPossibilities.forEach(possibility => {
	const throwingErrorDependencies = possibility.write ? ['mkdirp'] : ['mkdirp', 'isDirectory'];

	function p(...args) {
		return Object.assign({}, possibility, ...args)
	}

	throwingErrorDependencies.forEach(dependency => {
		test.cb(writeToPromiseAndCallbackStyleMacro, p({
			writeToPath: 'write/to/path/file.txt',
			writeToDependencies: getThrowingErrorDependency(dependency),
			expectError: `${dependency} dependency error`,
			assertAllFilesExist: [{
				path: 'write/to/path/file.txt',
				content: false
			}]
		}));

		test.cb(writeToPromiseAndCallbackStyleMacro, p({
			writeToRelativePath: 'write/to/relative/path/file.txt',
			writeToDependencies: getThrowingErrorDependency(dependency),
			expectError: `${dependency} dependency error`,
			assertAllFilesExist: [{
				path: 'write/to/relative/path/file.txt',
				content: false,
				relative: true
			}]
		}));
	});
});

/*-------------------------------------------------*/
/*-------------------------------------------------*/
/*-------------------------------------------------*/

test.cb(writeToPromiseAndCallbackStyleMacro, {
	write : 'failing promise',
	writeToPath: 'must-be-preserved.txt',
	expectError: 'Error getting the content of "{{{writeToPath}}}" => mock failing promise error'
})

test.cb(writeToPromiseAndCallbackStyleMacro, {
	write : 'failing function',
	writeToPath: 'must-be-preserved.txt',
	expectError: 'Error getting the content of "{{{writeToPath}}}" => mock failing function error'
})

test.cb(writeToPromiseAndCallbackStyleMacro, {
	copy : 'failing promise',
	writeToPath: 'must-be-preserved.txt',
	expectError: 'Error getting the original to copy to "{{{writeToPath}}}" => mock failing promise error'
})

test.cb(writeToPromiseAndCallbackStyleMacro, {
	copy : 'failing function',
	writeToPath: 'must-be-preserved.txt',
	expectError: 'Error getting the original to copy to "{{{writeToPath}}}" => mock failing function error'
})

test.cb('writeTo a non existent path', writeToPromiseAndCallbackStyleMacro, {
	write : 'failing promise',
	writeToPath: 'non/existent/path.txt',
	expectError: 'Error getting the content of "{{{writeToPath}}}" => mock failing promise error',
	assertAllFilesExist: [{
		path: 'non/existent/path.txt',
		content: false
	}]
})

test.cb('writeTo a non existent path', writeToPromiseAndCallbackStyleMacro, {
	write : 'failing function',
	writeToPath: 'non/existent/path.txt',
	expectError: 'Error getting the content of "{{{writeToPath}}}" => mock failing function error',
	assertAllFilesExist: [{
		path: 'non/existent/path.txt',
		content: false
	}]
})

test.cb('writeTo a non existent path', writeToPromiseAndCallbackStyleMacro, {
	copy : 'failing promise',
	writeToPath: 'non/existent/path.txt',
	expectError: 'Error getting the original to copy to "{{{writeToPath}}}" => mock failing promise error',
	assertAllFilesExist: [{
		path: 'non/existent/path.txt',
		content: false
	}]
})

test.cb('writeTo a non existent path', writeToPromiseAndCallbackStyleMacro, {
	copy : 'failing function',
	writeToPath: 'non/existent/path.txt',
	expectError: 'Error getting the original to copy to "{{{writeToPath}}}" => mock failing function error',
	assertAllFilesExist: [{
		path: 'non/existent/path.txt',
		content: false
	}]
})