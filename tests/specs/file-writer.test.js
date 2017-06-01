'use strict';

const assert = require('assert');
const test = require('ava');

const fs = require('fs');
const path = require('path');

const stream = require('stream');
const WritableStream = stream.Writable;
const ReadableStream = stream.Readable;

const dashify = require('dashify');
const intoStream = require('into-stream');

const requireFromIndex = require('../utils/require-from-index');

const createMockDirectory = require('../utils/create-mock-directory');

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

const writerPossibilities = [
	{ write: 'string' },
	{ write: 'buffer' },
	{ write: 'stream' },
	{ write: 'promise resolving string' },
	{ write: 'promise resolving buffer' },
	{ write: 'promise resolving stream' },
	{ write: 'promise resolving function resolving string' },
	{ write: 'promise resolving function resolving buffer' },
	{ write: 'promise resolving function resolving stream' },
	{ write: 'promise resolving promise resolving string' },
	{ write: 'promise resolving promise resolving buffer' },
	{ write: 'promise resolving promise resolving stream' },
	{ write: 'promise resolving promise resolving function resolving string' },
	{ write: 'promise resolving promise resolving function resolving buffer' },
	{ write: 'promise resolving promise resolving function resolving stream' },
	{ write: 'function resolving string' },
	{ write: 'function resolving buffer' },
	{ write: 'function resolving stream' },
	{ write: 'function resolving promise resolving string' },
	{ write: 'function resolving promise resolving buffer' },
	{ write: 'function resolving promise resolving stream' },
	{ write: 'function resolving function resolving string' },
	{ write: 'function resolving function resolving buffer' },
	{ write: 'function resolving function resolving stream' },
	{ write: 'function resolving promise resolving function resolving string' },
	{ write: 'function resolving promise resolving function resolving buffer' },
	{ write: 'function resolving promise resolving function resolving stream' },
	{ copy: 'path' },
	{ copy: 'promise resolving path' },
	{ copy: 'promise resolving function resolving path' },
	{ copy: 'promise resolving promise resolving path' },
	{ copy: 'function resolving path' },
	{ copy: 'function resolving promise resolving path' },
	{ copy: 'function resolving function resolving path' }
]

writerPossibilities.forEach(possibility => {
	const exploded = (possibility.write || possibility.copy).split(' ');
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
});

let possibilityTestIdentifierCount = 0;
function possibilityTestIdentifier() {
	return '_'+(possibilityTestIdentifierCount++);
}

function getWriteValue(writeType, stringContent, filePath) {
	writeType = writeType.trim();

	if(writeType === 'string'){
		return stringContent;
	}

	if (writeType === 'path') {
		return filePath;
	}

	if(writeType === 'buffer'){
		return Buffer.from(stringContent);
	}

	if(writeType === 'stream'){
		return intoStream(stringContent);
	}

	if (writeType.indexOf('promise resolving') === 0) {
		const resolveValue = getWriteValue(writeType.replace('promise resolving', ''), stringContent, filePath);
		return new Promise(resolve => setTimeout(()=>resolve(resolveValue), 50));
	}

	if (writeType.indexOf('function resolving') === 0) {
		const resolveValue = getWriteValue(writeType.replace('function resolving', ''), stringContent, filePath);
		return callback => {
			setTimeout(()=>{
				callback(null, resolveValue)
			}, 50);
		}
	}

	throw new Error(`unhandled writeType "${writeType}" for content "${stringContent}"`);
}

function getCopyValue(copyType, stringContent, callback) {
	createMockDirectory(dashify(stringContent)).then(directory => {
		const originalPath = directory.join(`${dashify(copyType+stringContent)}.txt`);

		fs.writeFile(originalPath, stringContent, {encoding: 'utf-8'}, err => {
			if (err) {callback(err);return;}

			copyType = copyType.trim();

			if(copyType === 'path'){
				callback(null, originalPath);return;
			}

			if (copyType.indexOf('promise resolving') === 0) {
				getCopyValue(copyType.replace('promise resolving', ''), stringContent, (err, resolveValue) => {
					if (err) {callback(err);return;}
					callback(null, new Promise(_resolve => setTimeout(()=>_resolve(resolveValue), 50)));
				});return;
			}

			if (copyType.indexOf('function resolving') === 0) {
				getCopyValue(copyType.replace('function resolving', ''), stringContent, (err, resolveValue) => {
					if (err) {callback(err);return;}
					callback(null, cb => {
						setTimeout(()=>{
							cb(null, resolveValue)
						}, 50);
					});
				});
				return;
			}

			reject(new Error(`unhandled copyType "${copyType}" for content "${stringContent}"`));
		});
	});
}

function testWriteToPossibilities(possibilities){
	const FileWriter = requireFromIndex('sources/file-writer');

	possibilities.forEach(({
		write = null,
		copy = null
	}) => {
		if ((!write && !copy) || !!write === !!copy) {
			throw new Error('Please provide a write value or a copy value');
		}

		function getWriterOptions(expectedContent, callback) {
			write ? callback({ write: getWriteValue(write, expectedContent) }) : getCopyValue(copy, expectedContent, (err, original) => {
				if (err) {throw err;}
				callback({ copy : original })
			});
		}
		
		function writeToTest(title, testCallback){
			test.cb(title, t => {
				const id = possibilityTestIdentifier();
				const expectedFile = `${dashify(title)}.txt`;
				const expectedContent = `${id} => ${title} -- file content`;

				getWriterOptions(expectedContent, writerOptions => {
					const writer = new FileWriter(writerOptions);

					t.plan(1);
					createMockDirectory(title).then(directory => {
						testCallback(directory, writer, expectedFile, expectedContent, t);
					});
				});
			});
		}

		const title_promise = `writeTo using ${write ? 'write' : 'copy'} with ${write || copy}`;
		writeToTest(title_promise, (directory, writer, expectedFile, expectedContent, t) => {
			const writeToPromise = writer.writeTo(directory.join(expectedFile));

			assert(writeToPromise instanceof Promise);

			writeToPromise.then(()=>{
				directory.assertAllFilesExist([{
					path: expectedFile,
					content: expectedContent
				}]).then(()=>{t.pass();t.end()});
			});
		});

		const title_cb = `${title_promise} - callback style`;
		writeToTest(title_cb, (directory, writer, expectedFile, expectedContent, t) => {
			const writeToResult = writer.writeTo(directory.join(expectedFile), err => {
				assert(!err);

				directory.assertAllFilesExist([{
					path: expectedFile,
					content: expectedContent
				}]).then(()=>{t.pass();t.end()});
			});

			assert.equal(writeToResult, null);
		});
	});
}

testWriteToPossibilities(writerPossibilities);

test('writeTo using write with a failing Promise', t => {
	const FileWriter = requireFromIndex('sources/file-writer');

	const writer = new FileWriter({
		write: new Promise((resolve, reject) => setTimeout(()=>reject(new Error('promise error')), 50))
	});

	t.plan(1);
	return createMockDirectory('write-to-using-write-with-a-failing-promise', 'must-be-preserved').then(directory => {
		const writeToPromise = writer.writeTo(directory.join('must-be-preserved.txt'));

		assert(writeToPromise instanceof Promise);

		return writeToPromise.then(()=>t.fail()).catch(err => {
			assert.equal(err.message, `Error getting the content of "${directory.join('must-be-preserved.txt')}" => promise error`);

			return directory.assertAllFilesExist([{
				path: 'must-be-preserved.txt',
				content: 'must-be-preserved'
			}]).then(()=>{t.pass();})
		});
	});
});

test.cb('writeTo using write with a failing Promise - callback style', t => {
	const FileWriter = requireFromIndex('sources/file-writer');

	const writer = new FileWriter({
		write: new Promise((resolve, reject) => setTimeout(()=>reject(new Error('promise error')), 50))
	});

	t.plan(1);
	createMockDirectory('write-to-using-write-with-a-failing-promise-callback-style', 'must-be-preserved').then(directory => {
		const writeToResult = writer.writeTo(directory.join('must-be-preserved.txt'), err => {
			assert.equal(err.message, `Error getting the content of "${directory.join('must-be-preserved.txt')}" => promise error`);

			directory.assertAllFilesExist([{
				path: 'must-be-preserved.txt',
				content: 'must-be-preserved'
			}]).then(()=>{t.pass();t.end()})
		});

		assert.equal(writeToResult, null);
	});
});

test('writeTo using write with a failing function', t => {
	const FileWriter = requireFromIndex('sources/file-writer');

	const writer = new FileWriter({
		write: callback => setTimeout(()=>callback(new Error('promise error')), 50)
	});

	t.plan(1);
	return createMockDirectory('write-to-using-write-with-a-failing-function', 'must-be-preserved').then(directory => {
		const writeToPromise = writer.writeTo(directory.join('must-be-preserved.txt'));

		assert(writeToPromise instanceof Promise);

		return writeToPromise.then(()=>t.fail()).catch(err=>{
			assert.equal(err.message, `Error getting the content of "${directory.join('must-be-preserved.txt')}" => promise error`);

			return directory.assertAllFilesExist([{
				path: 'must-be-preserved.txt',
				content: 'must-be-preserved'
			}]).then(()=>{t.pass();})
		});
	});
});

test.cb('writeTo using write with a failing function - callback style', t => {
	const FileWriter = requireFromIndex('sources/file-writer');

	const writer = new FileWriter({
		write: callback => setTimeout(()=>callback(new Error('promise error')), 50)
	});

	t.plan(1);
	createMockDirectory('write-to-using-write-with-a-failing-function-callback-style', 'must-be-preserved').then(directory => {
		const writeToResult = writer.writeTo(directory.join('must-be-preserved.txt'), err => {
			assert.equal(err.message, `Error getting the content of "${directory.join('must-be-preserved.txt')}" => promise error`);

			directory.assertAllFilesExist([{
				path: 'must-be-preserved.txt',
				content: 'must-be-preserved'
			}]).then(()=>{t.pass();t.end()})
		});

		assert.equal(writeToResult, null);
	});
});

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
		if ((!write && !copy) || !!write === !!copy) {
			throw new Error('Please provide a write value or a copy value');
		}

		dependencies.forEach(dependency => {
			function possibilityOptionsTest(title, defaultOptions = false){
				test(`${title}${defaultOptions ? ' -- default options' : ''}`, t => {
					const id = possibilityTestIdentifier();
					const expectedContent = `${id} => ${title} -- file content`;
					const expectedFile = `/absolute/path/${dashify(title)}.txt`;
					const expectedOptions = (defaultOptions ? expectedDependenciesDefaultOptions : expectedDependenciesOptions)[dependency];

					function getWriterOptions() {
						return write ? { write: getWriteValue(write, expectedContent) } : { copy: getWriteValue(copy, expectedContent, expectedFile) };
					}

					let passedFile = null;
					let passedContent = null;
					let passedOptions = null;

					const fileWriter = new FileWriter(Object.assign({}, (defaultOptions ? {} : expectedOptions), getWriterOptions()));

					t.plan(2);

					return fileWriter.writeTo(expectedFile, null, {
						fs: {
							writeFile(destPath, data, options, cb){
								if (dependency === 'fs.writeFile') {
									passedFile = destPath;
									passedContent = data;
									passedOptions = options;

									t.pass();
								}
								
								cb();
							},
							createReadStream(originPath, options){
								let stop = false;
								return new ReadableStream({
									read(){
										if (dependency === 'fs.createReadStream' && !stop) {
											passedFile = originPath;
											passedContent = expectedContent;
											passedOptions = options;

											t.pass();
										}

										this.push(stop ? null : expectedContent);
										stop = true;
									}
								});
							},
							createWriteStream(destPath, options){
								return new WritableStream({
									write (chunk, encoding, cb) {
										if (dependency === 'fs.createWriteStream') {
											passedFile = destPath;
											passedContent = chunk.toString('utf-8');
											passedOptions = options;
											
											t.pass();
										}
										cb();
									}
								});
							}
						}
					}).then(()=>{
						t.pass();

						assert.equal(passedFile, expectedFile);
						assert.equal(passedContent, expectedContent);
						assert.deepEqual(passedOptions, expectedOptions);
					});
				});
			}

			const _title = `writeTo options using ${write ? 'write' : 'copy'} with ${write || copy} - ${dependency} options`;

			possibilityOptionsTest(_title);
			possibilityOptionsTest(_title, /*defaultOptions*/ true);
		});
	});
}

testWriteToOptionsPossibilities(writerPossibilities);

// test.skip('writeTo using a non absolute path', t => {
// 	const FileWriter = requireFromIndex('sources/file-writer');
// });

// test.skip('writeTo using a non existent path', t => {
// 	const FileWriter = requireFromIndex('sources/file-writer');
// });

// test.skip('writeTo using a non existent path - callback style', t => {
// 	const FileWriter = requireFromIndex('sources/file-writer');
// });

// test.skip('unvalid instanciation', t => {
// 	const FileWriter = requireFromIndex('sources/file-writer');
// });
