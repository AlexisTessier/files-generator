'use strict';

const assert = require('assert');
const test = require('ava');

const path = require('path');

const stream = require('stream');
const WritableStream = stream.Writable;
const ReadableStream = stream.Readable;

const dashify = require('dashify');

const requireFromIndex = require('../utils/require-from-index');
const createTestDirectory = require('../utils/create-test-directory');

const mockFailingPromise = require('../mocks/mock-failing-promise');
const mockFailingAsyncFunction = require('../mocks/mock-failing-async-function');
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

test('instanciation using copy with a non absolute path', t => {
	const FileWriter = requireFromIndex('sources/file-writer');

	t.throws(()=>{
		new FileWriter({
			copy: 'path/to/copy'
		});
	});
});

test.cb('writeTo using a non absolute path', t => {
	const FileWriter = requireFromIndex('sources/file-writer');

	t.plan(2);

	const writer = new FileWriter({
		write: 'file-content'
	});
	let passedPath = null;
	let passedContent = null;

	const fs = {
		writeFile(path, content, options, cb){
			passedPath = path;
			passedContent = content;

			cb();
		},
		createWriteStream(){},
		createReadStream(){}
	};

	t.throws(()=>{
		writer.writeTo('no/absolute/path.txt', null, { fs })
	});

	let writeToPromise = null;
	try{
		writeToPromise = writer.writeTo('no/absolute/path.txt', null, { fs });
	}
	catch(err){}
	assert.equal(writeToPromise, null)
	
	setTimeout(()=>{
		assert.equal(passedPath, null);
		assert.equal(passedContent, null);

		t.pass();
		t.end();
	}, 500);
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

writeToTestPromiseAndCallbackStyle('writeTo using write with a failing Promise', {
	writerConfig: {
		write: mockFailingPromise()
	},
	testDirectory: {
		title: 'write-to-using-write-with-a-failing-promise',
		template: 'must-be-preserved'
	},
	writeTo: 'must-be-preserved.txt',
	expectError: 'Error getting the content of "{{{writeToPath}}}" => promise error',
	assertAllFilesExist: [{
		path: 'must-be-preserved.txt',
		content: 'must-be-preserved'
	}]
})

writeToTestPromiseAndCallbackStyle('writeTo using write with a failing function', {
	writerConfig: {
		write: mockFailingAsyncFunction()
	},
	testDirectory: {
		title: 'write-to-using-write-with-a-failing-function',
		template: 'must-be-preserved'
	},
	writeTo: 'must-be-preserved.txt',
	expectError: 'Error getting the content of "{{{writeToPath}}}" => callback function error',
	assertAllFilesExist: [{
		path: 'must-be-preserved.txt',
		content: 'must-be-preserved'
	}]
})

writeToTestPromiseAndCallbackStyle('writeTo using copy with a failing Promise', {
	writerConfig: {
		copy: mockFailingPromise()
	},
	testDirectory: {
		title: 'write-to-using-copy-with-a-failing-promise',
		template: 'must-be-preserved'
	},
	writeTo: 'must-be-preserved.txt',
	expectError: 'Error getting the original to copy to "{{{writeToPath}}}" => promise error',
	assertAllFilesExist: [{
		path: 'must-be-preserved.txt',
		content: 'must-be-preserved'
	}]
})

writeToTestPromiseAndCallbackStyle('writeTo using copy with a failing function', {
	writerConfig: {
		copy: mockFailingAsyncFunction()
	},
	testDirectory: {
		title: 'write-to-using-copy-with-a-failing-function',
		template: 'must-be-preserved'
	},
	writeTo: 'must-be-preserved.txt',
	expectError: 'Error getting the original to copy to "{{{writeToPath}}}" => callback function error',
	assertAllFilesExist: [{
		path: 'must-be-preserved.txt',
		content: 'must-be-preserved'
	}]
})

writeToTestPromiseAndCallbackStyle('writeTo a non existent path using write with a failing Promise', {
	writerConfig: {
		write: mockFailingPromise()
	},
	testDirectory: {
		title: 'write-to-an-non-existent-path-using-write-with-a-failing-promise',
		template: 'must-be-preserved'
	},
	writeTo: 'non/existent/path.txt',
	expectError: 'Error getting the content of "{{{writeToPath}}}" => promise error',
	assertAllFilesExist: [{
		path: 'must-be-preserved.txt',
		content: 'must-be-preserved'
	}, {
		path: 'non/existent/path.txt',
		content: false
	}]
})

writeToTestPromiseAndCallbackStyle('writeTo a non existent path using write with a failing function', {
	writerConfig: {
		write: mockFailingAsyncFunction()
	},
	testDirectory: {
		title: 'write-to-an-non-existent-path-using-write-with-a-failing-function',
		template: 'must-be-preserved'
	},
	writeTo: 'non/existent/path.txt',
	expectError: 'Error getting the content of "{{{writeToPath}}}" => callback function error',
	assertAllFilesExist: [{
		path: 'must-be-preserved.txt',
		content: 'must-be-preserved'
	}, {
		path: 'non/existent/path.txt',
		content: false
	}]
})

writeToTestPromiseAndCallbackStyle('writeTo a non existent path using copy with a failing Promise', {
	writerConfig: {
		copy: mockFailingPromise()
	},
	testDirectory: {
		title: 'write-to-an-non-existent-path-using-copy-with-a-failing-promise',
		template: 'must-be-preserved'
	},
	writeTo: 'non/existent/path.txt',
	expectError: 'Error getting the original to copy to "{{{writeToPath}}}" => promise error',
	assertAllFilesExist: [{
		path: 'must-be-preserved.txt',
		content: 'must-be-preserved'
	}, {
		path: 'non/existent/path.txt',
		content: false
	}]
})

writeToTestPromiseAndCallbackStyle('writeTo a non existent path using copy with a failing function', {
	writerConfig: {
		copy: mockFailingAsyncFunction()
	},
	testDirectory: {
		title: 'write-to-an-non-existent-path-using-copy-with-a-failing-function',
		template: 'must-be-preserved'
	},
	writeTo: 'non/existent/path.txt',
	expectError: 'Error getting the original to copy to "{{{writeToPath}}}" => callback function error',
	assertAllFilesExist: [{
		path: 'must-be-preserved.txt',
		content: 'must-be-preserved'
	}, {
		path: 'non/existent/path.txt',
		content: false
	}]
})

/*-------------------------------------------------*/
/*-------------------------------------------------*/
/*-------------------------------------------------*/

const writerPossibilities = require('../settings/file-writer.test-config');

testWriteToPossibilities(writerPossibilities);
testWriteToOptionsPossibilities(writerPossibilities);
testDependenciesThrowingAnError(writerPossibilities);

function testWriteToPossibilities(possibilities){
	possibilities.forEach(({
		write = null,
		copy = null
	}) => {
		function writeToTest(title, expectedFileBasePath = null){
			const expectedFile = `${dashify(title)}.txt`;
			let expectedContent = `${title} -- file content`;

			const fullExpectedFilePath = expectedFileBasePath ? path.join(expectedFileBasePath, expectedFile) : expectedFile;

			const types = (write || copy).split(' ');
			const lastType = types[types.length - 1];

			writeToTestPromiseAndCallbackStyle(title, {
				writerConfigMockParams: [{write, copy}, expectedContent],
				testDirectory: {title: dashify(title)},
				writeTo: fullExpectedFilePath,
				assertAllFilesExist: [{
					path: fullExpectedFilePath,
					content: lastType === 'directory' ? true : expectedContent
				}]
			});
		}

		writeToTest(`writeTo using ${write ? 'write' : 'copy'} with ${write || copy}`);
		writeToTest(`writeTo a non existent path using ${write ? 'write' : 'copy'} with ${write || copy}`, 'unexistent/path/to');
	});
}

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
			function possibilityOptionsTest(title, defaultOptions = false){
				test.cb(`${title}${defaultOptions ? ' -- default options' : ''}`, t => {
					const expectedFile = `/absolute/path/${dashify(title)}.txt`;
					const expectedContent = `${title} -- file content`;
					const expectedOptions = (defaultOptions ? expectedDependenciesDefaultOptions : expectedDependenciesOptions)[dependency];

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
			possibilityOptionsTest(_title, /*defaultOptions*/ true);
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
			function throwingErrorDependenciesTest(title){
				const expectedFile = `${dashify(title)}.txt`;
				let expectedContent = `${title} -- file content`;

				writeToTestPromiseAndCallbackStyle(title, {
					writerConfigMockParams: [{ write, copy }, expectedContent],
					testDirectory: {title: dashify(title)},
					writeTo: expectedFile,
					writeToDependencies: getThrowingErrorDependency(dep),
					expectError: `${dep} dependency error`,
					assertAllFilesExist: [{
						path: expectedFile,
						content: false
					}]
				});
			}

			throwingErrorDependenciesTest(`writeTo using ${write ? 'write' : 'copy'} with ${write || copy} and the dependency "${dep}" throwing an error`);
		});
	});
}

/*-------------------------------------------------*/
/*-------------------------------------------------*/
/*-------------------------------------------------*/

function writeToTestPromiseAndCallbackStyle(title, {
	writerConfig = null,
	writerConfigMockParams = null,
	testDirectory,
	writeTo,
	writeToDependencies = undefined,
	expectError,
	assertAllFilesExist
}) {
	assert((writerConfig && writerConfigMockParams === null) || (writerConfigMockParams && writerConfig === null));
	
	test.cb(title, t => {
		const FileWriter = requireFromIndex('sources/file-writer');

		if (writerConfig) {
			testWithConfig(writerConfig)
		}
		else{
			mockFileWriterOptionsObject(writerConfigMockParams[0], writerConfigMockParams[1], writerConfig => {
				testWithConfig(writerConfig);
			});
		}

		function testWithConfig(conf){
			const writer = new FileWriter(conf);

			t.plan(1);
			createTestDirectory(testDirectory, directory => {
				const writeToPromise = writer.writeTo(directory.join(writeTo), null, writeToDependencies);

				assert(writeToPromise instanceof Promise);

				if(expectError){
					writeToPromise.then(()=>{t.fail();}).catch(err => {
						assert.equal(err.message, expectError.replace('{{{writeToPath}}}', directory.join(writeTo)));

						if (assertAllFilesExist) {
							directory.assertAllFilesExist(assertAllFilesExist, ()=>{t.pass();t.end();})
						}
						else{
							t.pass();t.end();
						}
					});
				}
				else if(assertAllFilesExist){
					writeToPromise.then(()=>{
						directory.assertAllFilesExist(assertAllFilesExist, ()=>{t.pass();t.end();})
					}).catch(err => {t.fail();t.end()});
				}
				else{
					t.pass();t.end();
				}
			});
		}
	});

	const callbackTestDirectory = Object.assign({}, testDirectory);
	callbackTestDirectory.title += '-callback-style';
	test.cb(`${title} - callback style`, t => {
		const FileWriter = requireFromIndex('sources/file-writer');

		if (writerConfig) {
			testWithConfig(writerConfig)
		}
		else{
			mockFileWriterOptionsObject(writerConfigMockParams[0], writerConfigMockParams[1], writerConfig => {
				testWithConfig(writerConfig);
			});
		}

		function testWithConfig(conf){
			const writer = new FileWriter(conf);

			t.plan(1);
			createTestDirectory(callbackTestDirectory, directory => {
				const writeToResult = writer.writeTo(directory.join(writeTo), err => {
					if(expectError){
						assert.equal(err.message, expectError.replace('{{{writeToPath}}}', directory.join(writeTo)));
					}
					else{
						assert(!err);
					}

					if (assertAllFilesExist) {
						directory.assertAllFilesExist(assertAllFilesExist, ()=>{t.pass();t.end()})
					}
					else{
						t.pass();t.end();
					}
				}, writeToDependencies);

				assert.equal(writeToResult, null);
			});
		}
	});
}