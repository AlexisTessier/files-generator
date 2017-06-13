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
			}).catch(err => {assert.equal(!!err, false, `${t.title} shouldn't throw error`)});
		}
	});
}
writeToPromiseStyleMacro.title = (providedTitle, info) => `.writeTo() using ${info.write ? 'write' : 'copy'} with a ${info.write || info.copy} - promise style`;

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
				assert(!err, `${t.title} shouldn't throw error`);
			}

			assertAllFilesExist(()=>{t.pass();t.end()})
		}, writeToDependencies);

		assert.equal(writeToResult, null);
	});
}
writeToCallbackStyleMacro.title = (providedTitle, info) => `${providedTitle} - .writeTo() using ${info.write ? 'write' : 'copy'} with a ${info.write || info.copy} - callback style`;

const writeToPromiseAndCallbackStyleMacro = [writeToPromiseStyleMacro, writeToCallbackStyleMacro];

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

/*-------------------------------------------------*/
/*-------------------------------------------------*/
/*-------------------------------------------------*/

const writerPossibilities = require('../settings/file-writer.test-config');

test.cb(writeToPromiseAndCallbackStyleMacro, {
	write: 'string',
	expectFileWasCreated: true
})

test.cb('writeTo a non existent path', writeToPromiseAndCallbackStyleMacro, {
	write: 'string',
	writeToPath: 'unexistent/path/to/file.txt',
	expectFileWasCreated: true
})

test.cb('writeTo a relative path', writeToPromiseAndCallbackStyleMacro, {
	write: 'string',
	writeToRelativePath: 'relative/path/to/file.txt',
	expectFileWasCreated: true
})

test.cb('writeTo a relative path with a custom cwd', writeToPromiseAndCallbackStyleMacro, {
	write: 'string',
	writeToRelativePath: 'relative/path/to/file.txt',
	expectFileWasCreated: true,
	writeToDependencies: {
		cwd: true
	}
})

//testWriteToPossibilities(writerPossibilities);
//testWriteToOptionsPossibilities(writerPossibilities);
//testDependenciesThrowingAnError(writerPossibilities);

function testWriteToOptionsPossibilities(possibilities){
	const FileWriter = requireFromIndex('sources/file-writer');

	const expectedDependenciesOptions = {
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

	const expectedDependenciesDefaultOptions = {
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

	possibilities.forEach(({
		write = null,
		copy = null,
		dependencies,
	}) => {
		assert(Array.isArray(dependencies), `Please provide the dependencies for the possibility "${write || copy}"`);

		dependencies.forEach(dependency => {
			function possibilityOptionsTest(title, {
				defaultOptions = null
			} = {}){
				test.cb(`${title}${defaultOptions ? ' -- default options' : ''}`, t => {
					const expectedFile = `/absolute/path/${dashify(title)}.txt`;
					const expectedContent = `${title} -- file content`;
					const expectedOptions = (defaultOptions ? defaultOptions : expectedDependenciesOptions)[dependency];

					t.plan(2);

					mockFileWriterOptionsObject({write, copy}, expectedContent, (writerOptions, expectedPathToCopy) => {
						const fileWriter = new FileWriter(Object.assign({}, (defaultOptions ? {} : expectedOptions), writerOptions));

						fileWriter.writeTo(expectedFile, null, {
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
						}).then(()=>{
							t.pass();t.end();
						});
					});
				});
			}

			const _title = `writeTo options using ${write ? 'write' : 'copy'} with ${write || copy} - ${dependency} options`;

			possibilityOptionsTest(_title);
			possibilityOptionsTest(_title, {
				defaultOptions: expectedDependenciesDefaultOptions
			});
		});
	});
}

function testDependenciesThrowingAnError(possibilities) {
	possibilities.forEach(({
		write = null,
		copy = null
	}) => {
		const throwingErrorDependencies = write ? ['mkdirp'] : ['mkdirp', 'isDirectory'];

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

		throwingErrorDependencies.forEach(dep => {
			function throwingErrorDependenciesTest(title, relative = false){
				const expectedFile = `${dashify(title)}.txt`;
				let expectedContent = `${title} -- file content`;

				writeToTestPromiseAndCallbackStyle(title, {
					writerConfigMockParams: [{ write, copy }, expectedContent],
					testDirectory: {title: dashify(title), relative},
					writeTo: expectedFile,
					writeToDependencies: getThrowingErrorDependency(dep),
					expectError: `${dep} dependency error`,
					assertAllFilesExist: [{
						path: expectedFile,
						content: false,
						relative
					}]
				});
			}

			throwingErrorDependenciesTest(`writeTo using ${write ? 'write' : 'copy'} with ${write || copy} and the dependency "${dep}" throwing an error`);
			throwingErrorDependenciesTest(`writeTo a relative path using ${write ? 'write' : 'copy'} with ${write || copy} and the dependency "${dep}" throwing an error`, /*relative*/ true);
		});
	});
}