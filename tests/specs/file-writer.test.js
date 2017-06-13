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

function writeToPromiseStyleMacro(t, {
	write,
	copy,
	writeToPath,
	writeToDependencies,
	expectError,
	assertAllFilesExist = [],
	copyOriginalPath = null,
	expectedFileContent = null,
	custom_cwd
}){
	assert((write || copy) && (!!write !== !!copy));

	assertAllFilesExist = [...assertAllFilesExist, {
		path: 'must-be-preserved.txt',
		content: 'must-be-preserved'
	}];

	createTestDirectory({
		title: dashify(t.title),
		template: 'must-be-preserved'
	}, destDirectory => {


	});

	//function testWith()

	//defaultExpectedFileContent = 

	// mockFileWriterOptionsObject({
	// 	write, copy
	// }, copy ? (copyOriginalPath) :, writerConfig => {

	// });

	// const FileWriter = requireFromIndex('sources/file-writer');

	// const writerConfig = write ? {write} : {copy};


	// 	if (writerConfig) {
	// 		testWithConfig(writerConfig)
	// 	}
	// 	else{
	// 		mockFileWriterOptionsObject(writerConfigMockParams[0], writerConfigMockParams[1], writerConfig => {
	// 			testWithConfig(writerConfig);
	// 		});
	// 	}

	// 	function testWithConfig(conf){
	// 		const writer = new FileWriter(conf);

	// 		t.plan(1);
	// 		createTestDirectory(testDirectory, directory => {
	// 			const writeToPromise = writer.writeTo(custom_cwd ? writeTo : directory.join(writeTo), null, Object.assign({
	// 				cwd : custom_cwd ?  directory.absolutePath : undefined
	// 			}, writeToDependencies));

	// 			assert(writeToPromise instanceof Promise);

	// 			if(expectError){
	// 				writeToPromise.then(()=>{t.fail();}).catch(err => {
	// 					assert.equal(err.message, expectError.replace('{{{writeToPath}}}', directory.join(writeTo)));

	// 					if (assertAllFilesExist) {
	// 						directory.assertAllFilesExist(assertAllFilesExist, ()=>{t.pass();t.end();})
	// 					}
	// 					else{
	// 						t.pass();t.end();
	// 					}
	// 				});
	// 			}
	// 			else if(assertAllFilesExist){
	// 				writeToPromise.then(()=>{
	// 					directory.assertAllFilesExist(assertAllFilesExist, ()=>{t.pass();t.end();})
	// 				}).catch(err => {throw err});
	// 			}
	// 			else{
	// 				t.pass();t.end();
	// 			}
	// 		});
	// 	}
}

writeToPromiseStyleMacro.title = (providedTitle, info) => `.writeTo() using ${info.write ? 'write' : 'copy'} with a ${info.write.trim()} - promise style`;

test.cb([writeToPromiseStyleMacro], {
	write : 'failing promise',
	writeToPath: 'must-be-preserved.txt',
	expectError: 'Error getting the content of "{{{writeToPath}}}" => promise error'
})

test.cb([writeToPromiseStyleMacro], {
	write : 'failing function',
	writeToPath: 'must-be-preserved.txt',
	expectError: 'Error getting the content of "{{{writeToPath}}}" => callback function error'
})

test.cb([writeToPromiseStyleMacro], {
	copy : 'failing promise',
	writeToPath: 'must-be-preserved.txt',
	expectError: 'Error getting the original to copy to "{{{writeToPath}}}" => promise error'
})

test.cb([writeToPromiseStyleMacro], {
	copy : 'failing function',
	writeToPath: 'must-be-preserved.txt',
	expectError: 'Error getting the original to copy to "{{{writeToPath}}}" => callback function error'
})

// writeToTestPromiseAndCallbackStyle('writeTo a non existent path using write with a failing Promise', {
// 	writerConfig: {
// 		write: mockFailingPromise()
// 	},
// 	testDirectory: {
// 		title: 'write-to-an-non-existent-path-using-write-with-a-failing-promise',
// 		template: 'must-be-preserved'
// 	},
// 	writeTo: 'non/existent/path.txt',
// 	expectError: 'Error getting the content of "{{{writeToPath}}}" => promise error',
// 	assertAllFilesExist: [{
// 		path: 'must-be-preserved.txt',
// 		content: 'must-be-preserved'
// 	}, {
// 		path: 'non/existent/path.txt',
// 		content: false
// 	}]
// })

// writeToTestPromiseAndCallbackStyle('writeTo a non existent path using write with a failing function', {
// 	writerConfig: {
// 		write: mockFailingAsyncFunction()
// 	},
// 	testDirectory: {
// 		title: 'write-to-an-non-existent-path-using-write-with-a-failing-function',
// 		template: 'must-be-preserved'
// 	},
// 	writeTo: 'non/existent/path.txt',
// 	expectError: 'Error getting the content of "{{{writeToPath}}}" => callback function error',
// 	assertAllFilesExist: [{
// 		path: 'must-be-preserved.txt',
// 		content: 'must-be-preserved'
// 	}, {
// 		path: 'non/existent/path.txt',
// 		content: false
// 	}]
// })

// writeToTestPromiseAndCallbackStyle('writeTo a non existent path using copy with a failing Promise', {
// 	writerConfig: {
// 		copy: mockFailingPromise()
// 	},
// 	testDirectory: {
// 		title: 'write-to-an-non-existent-path-using-copy-with-a-failing-promise',
// 		template: 'must-be-preserved'
// 	},
// 	writeTo: 'non/existent/path.txt',
// 	expectError: 'Error getting the original to copy to "{{{writeToPath}}}" => promise error',
// 	assertAllFilesExist: [{
// 		path: 'must-be-preserved.txt',
// 		content: 'must-be-preserved'
// 	}, {
// 		path: 'non/existent/path.txt',
// 		content: false
// 	}]
// })

// writeToTestPromiseAndCallbackStyle('writeTo a non existent path using copy with a failing function', {
// 	writerConfig: {
// 		copy: mockFailingAsyncFunction()
// 	},
// 	testDirectory: {
// 		title: 'write-to-an-non-existent-path-using-copy-with-a-failing-function',
// 		template: 'must-be-preserved'
// 	},
// 	writeTo: 'non/existent/path.txt',
// 	expectError: 'Error getting the original to copy to "{{{writeToPath}}}" => callback function error',
// 	assertAllFilesExist: [{
// 		path: 'must-be-preserved.txt',
// 		content: 'must-be-preserved'
// 	}, {
// 		path: 'non/existent/path.txt',
// 		content: false
// 	}]
// })

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
		function writeToTest(title, expectedFileBasePath = null, relative = false, custom_cwd = false){
			const expectedFile = `${dashify(title)}.txt`;
			let expectedContent = `${title} -- file content`;

			const fullExpectedFilePath = expectedFileBasePath ? path.join(expectedFileBasePath, expectedFile) : expectedFile;

			const types = (write || copy).split(' ');
			const lastType = types[types.length - 1];

			writeToTestPromiseAndCallbackStyle(title, {
				writerConfigMockParams: [{write, copy}, expectedContent],
				testDirectory: {title: dashify(title), relative},
				writeTo: fullExpectedFilePath,
				custom_cwd,
				assertAllFilesExist: [{
					path: fullExpectedFilePath,
					content: lastType === 'directory' ? true : expectedContent,
					relative
				}]
			});
		}

		writeToTest(`writeTo using ${write ? 'write' : 'copy'} with ${write || copy}`);
		writeToTest(`writeTo a non existent path using ${write ? 'write' : 'copy'} with ${write || copy}`, 'unexistent/path/to');
		writeToTest(`writeTo a relative path using ${write ? 'write' : 'copy'} with ${write || copy}`, 'relative/path/to', /*relative*/true);
		writeToTest(`writeTo a relative path using ${write ? 'write' : 'copy'} with ${write || copy} and a custom cwd`, 'relative/path/to', /*relative*/true, /*custom_cwd*/true);
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

/*-------------------------------------------------*/
/*-------------------------------------------------*/
/*-------------------------------------------------*/

function writeToTestPromiseAndCallbackStyle(title, {
	writerConfig = null,
	writerConfigMockParams = null,
	testDirectory,
	writeTo,
	writeToDependencies = undefined,
	custom_cwd = false,
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
				const writeToPromise = writer.writeTo(custom_cwd ? writeTo : directory.join(writeTo), null, Object.assign({
					cwd : custom_cwd ?  directory.absolutePath : undefined
				}, writeToDependencies));

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
					}).catch(err => {throw err});
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
				const writeToResult = writer.writeTo(custom_cwd ? writeTo : directory.join(writeTo), err => {
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
				}, Object.assign({
					cwd : custom_cwd ?  directory.absolutePath : undefined
				}, writeToDependencies));

				assert.equal(writeToResult, null);
			});
		}
	});
}