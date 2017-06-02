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

test('writeTo using copy with a failing Promise', t => {
	const FileWriter = requireFromIndex('sources/file-writer');

	const writer = new FileWriter({
		copy: new Promise((resolve, reject) => setTimeout(()=>reject(new Error('promise error')), 50))
	});

	t.plan(1);
	return createMockDirectory('write-to-using-copy-with-a-failing-promise', 'must-be-preserved').then(directory => {
		const writeToPromise = writer.writeTo(directory.join('must-be-preserved.txt'));

		assert(writeToPromise instanceof Promise);

		return writeToPromise.then(()=>t.fail()).catch(err => {
			assert.equal(err.message, `Error getting the original to copy to "${directory.join('must-be-preserved.txt')}" => promise error`);

			return directory.assertAllFilesExist([{
				path: 'must-be-preserved.txt',
				content: 'must-be-preserved'
			}]).then(()=>{t.pass();})
		});
	});
});

test.cb('writeTo using copy with a failing Promise - callback style', t => {
	const FileWriter = requireFromIndex('sources/file-writer');

	const writer = new FileWriter({
		copy: new Promise((resolve, reject) => setTimeout(()=>reject(new Error('promise error')), 50))
	});

	t.plan(1);
	createMockDirectory('write-to-using-copy-with-a-failing-promise-callback-style', 'must-be-preserved').then(directory => {
		const writeToResult = writer.writeTo(directory.join('must-be-preserved.txt'), err => {
			assert.equal(err.message, `Error getting the original to copy to "${directory.join('must-be-preserved.txt')}" => promise error`);

			directory.assertAllFilesExist([{
				path: 'must-be-preserved.txt',
				content: 'must-be-preserved'
			}]).then(()=>{t.pass();t.end()})
		});

		assert.equal(writeToResult, null);
	});
});

test('writeTo using copy with a failing function', t => {
	const FileWriter = requireFromIndex('sources/file-writer');

	const writer = new FileWriter({
		copy: callback => setTimeout(()=>callback(new Error('promise error')), 50)
	});

	t.plan(1);
	return createMockDirectory('write-to-using-copy-with-a-failing-function', 'must-be-preserved').then(directory => {
		const writeToPromise = writer.writeTo(directory.join('must-be-preserved.txt'));

		assert(writeToPromise instanceof Promise);

		return writeToPromise.then(()=>t.fail()).catch(err=>{
			assert.equal(err.message, `Error getting the original to copy to "${directory.join('must-be-preserved.txt')}" => promise error`);

			return directory.assertAllFilesExist([{
				path: 'must-be-preserved.txt',
				content: 'must-be-preserved'
			}]).then(()=>{t.pass();})
		});
	});
});

test.cb('writeTo using copy with a failing function - callback style', t => {
	const FileWriter = requireFromIndex('sources/file-writer');

	const writer = new FileWriter({
		copy: callback => setTimeout(()=>callback(new Error('promise error')), 50)
	});

	t.plan(1);
	createMockDirectory('write-to-using-copy-with-a-failing-function-callback-style', 'must-be-preserved').then(directory => {
		const writeToResult = writer.writeTo(directory.join('must-be-preserved.txt'), err => {
			assert.equal(err.message, `Error getting the original to copy to "${directory.join('must-be-preserved.txt')}" => promise error`);

			directory.assertAllFilesExist([{
				path: 'must-be-preserved.txt',
				content: 'must-be-preserved'
			}]).then(()=>{t.pass();t.end()})
		});

		assert.equal(writeToResult, null);
	});
});

test('writeTo an non existent path using write with a failing Promise', t => {
	const FileWriter = requireFromIndex('sources/file-writer');

	const writer = new FileWriter({
		write: new Promise((resolve, reject) => setTimeout(()=>reject(new Error('promise error')), 50))
	});

	t.plan(1);
	return createMockDirectory('write-to-an-non-existent-path-using-write-with-a-failing-promise', 'must-be-preserved').then(directory => {
		const writeToPromise = writer.writeTo(directory.join('non/existent/path.txt'));

		assert(writeToPromise instanceof Promise);

		return writeToPromise.then(()=>t.fail()).catch(err => {
			assert.equal(err.message, `Error getting the content of "${directory.join('non/existent/path.txt')}" => promise error`);

			return directory.assertAllFilesExist([{
				path: 'must-be-preserved.txt',
				content: 'must-be-preserved'
			}, {
				path: 'non/existent/path.txt',
				content: false
			}]).then(()=>{t.pass();})
		});
	});
});

test.cb('writeTo an non existent path using write with a failing Promise - callback style', t => {
	const FileWriter = requireFromIndex('sources/file-writer');

	const writer = new FileWriter({
		write: new Promise((resolve, reject) => setTimeout(()=>reject(new Error('promise error')), 50))
	});

	t.plan(1);
	createMockDirectory('write-to-an-non-existent-path-using-write-with-a-failing-promise-callback-style', 'must-be-preserved').then(directory => {
		const writeToResult = writer.writeTo(directory.join('non/existent/path.txt'), err => {
			assert.equal(err.message, `Error getting the content of "${directory.join('non/existent/path.txt')}" => promise error`);

			directory.assertAllFilesExist([{
				path: 'must-be-preserved.txt',
				content: 'must-be-preserved'
			}, {
				path: 'non/existent/path.txt',
				content: false
			}]).then(()=>{t.pass();t.end()})
		});

		assert.equal(writeToResult, null);
	});
});

test('writeTo an non existent path using write with a failing function', t => {
	const FileWriter = requireFromIndex('sources/file-writer');

	const writer = new FileWriter({
		write: callback => setTimeout(()=>callback(new Error('promise error')), 50)
	});

	t.plan(1);
	return createMockDirectory('write-to-an-non-existent-path-using-write-with-a-failing-function', 'must-be-preserved').then(directory => {
		const writeToPromise = writer.writeTo(directory.join('non/existent/path.txt'));

		assert(writeToPromise instanceof Promise);

		return writeToPromise.then(()=>t.fail()).catch(err=>{
			assert.equal(err.message, `Error getting the content of "${directory.join('non/existent/path.txt')}" => promise error`);

			return directory.assertAllFilesExist([{
				path: 'must-be-preserved.txt',
				content: 'must-be-preserved'
			}, {
				path: 'non/existent/path.txt',
				content: false
			}]).then(()=>{t.pass();})
		});
	});
});

test.cb('writeTo an non existent path using write with a failing function - callback style', t => {
	const FileWriter = requireFromIndex('sources/file-writer');

	const writer = new FileWriter({
		write: callback => setTimeout(()=>callback(new Error('promise error')), 50)
	});

	t.plan(1);
	createMockDirectory('write-to-an-non-existent-path-using-write-with-a-failing-function-callback-style', 'must-be-preserved').then(directory => {
		const writeToResult = writer.writeTo(directory.join('non/existent/path.txt'), err => {
			assert.equal(err.message, `Error getting the content of "${directory.join('non/existent/path.txt')}" => promise error`);

			directory.assertAllFilesExist([{
				path: 'must-be-preserved.txt',
				content: 'must-be-preserved'
			}, {
				path: 'non/existent/path.txt',
				content: false
			}]).then(()=>{t.pass();t.end()})
		});

		assert.equal(writeToResult, null);
	});
});

test('writeTo an non existent path using copy with a failing Promise', t => {
	const FileWriter = requireFromIndex('sources/file-writer');

	const writer = new FileWriter({
		copy: new Promise((resolve, reject) => setTimeout(()=>reject(new Error('promise error')), 50))
	});

	t.plan(1);
	return createMockDirectory('write-to-an-non-existent-path-using-copy-with-a-failing-promise', 'must-be-preserved').then(directory => {
		const writeToPromise = writer.writeTo(directory.join('non/existent/path.txt'));

		assert(writeToPromise instanceof Promise);

		return writeToPromise.then(()=>t.fail()).catch(err => {
			assert.equal(err.message, `Error getting the original to copy to "${directory.join('non/existent/path.txt')}" => promise error`);

			return directory.assertAllFilesExist([{
				path: 'must-be-preserved.txt',
				content: 'must-be-preserved'
			}, {
				path: 'non/existent/path.txt',
				content: false
			}]).then(()=>{t.pass();})
		});
	});
});

test.cb('writeTo an non existent path using copy with a failing Promise - callback style', t => {
	const FileWriter = requireFromIndex('sources/file-writer');

	const writer = new FileWriter({
		copy: new Promise((resolve, reject) => setTimeout(()=>reject(new Error('promise error')), 50))
	});

	t.plan(1);
	createMockDirectory('write-to-an-non-existent-path-using-copy-with-a-failing-promise-callback-style', 'must-be-preserved').then(directory => {
		const writeToResult = writer.writeTo(directory.join('non/existent/path.txt'), err => {
			assert.equal(err.message, `Error getting the original to copy to "${directory.join('non/existent/path.txt')}" => promise error`);

			directory.assertAllFilesExist([{
				path: 'must-be-preserved.txt',
				content: 'must-be-preserved'
			}, {
				path: 'non/existent/path.txt',
				content: false
			}]).then(()=>{t.pass();t.end()})
		});

		assert.equal(writeToResult, null);
	});
});

test('writeTo an non existent path using copy with a failing function', t => {
	const FileWriter = requireFromIndex('sources/file-writer');

	const writer = new FileWriter({
		copy: callback => setTimeout(()=>callback(new Error('promise error')), 50)
	});

	t.plan(1);
	return createMockDirectory('write-to-an-non-existent-path-using-copy-with-a-failing-function', 'must-be-preserved').then(directory => {
		const writeToPromise = writer.writeTo(directory.join('non/existent/path.txt'));

		assert(writeToPromise instanceof Promise);

		return writeToPromise.then(()=>t.fail()).catch(err=>{
			assert.equal(err.message, `Error getting the original to copy to "${directory.join('non/existent/path.txt')}" => promise error`);

			return directory.assertAllFilesExist([{
				path: 'must-be-preserved.txt',
				content: 'must-be-preserved'
			}, {
				path: 'non/existent/path.txt',
				content: false
			}]).then(()=>{t.pass();})
		});
	});
});

test.cb('writeTo an non existent path using copy with a failing function - callback style', t => {
	const FileWriter = requireFromIndex('sources/file-writer');

	const writer = new FileWriter({
		copy: callback => setTimeout(()=>callback(new Error('promise error')), 50)
	});

	t.plan(1);
	createMockDirectory('write-to-an-non-existent-path-using-copy-with-a-failing-function-callback-style', 'must-be-preserved').then(directory => {
		const writeToResult = writer.writeTo(directory.join('non/existent/path.txt'), err => {
			assert.equal(err.message, `Error getting the original to copy to "${directory.join('non/existent/path.txt')}" => promise error`);

			directory.assertAllFilesExist([{
				path: 'must-be-preserved.txt',
				content: 'must-be-preserved'
			}, {
				path: 'non/existent/path.txt',
				content: false
			}]).then(()=>{t.pass();t.end()})
		});

		assert.equal(writeToResult, null);
	});
});

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
	{ copy: 'path' },
	{ copy: 'directory' },
	{ copy: 'promise resolving path' },
	{ copy: 'promise resolving directory' },
	{ copy: 'promise resolving function resolving path' },
	{ copy: 'promise resolving function resolving directory' },
	{ copy: 'promise resolving promise resolving path' },
	{ copy: 'promise resolving promise resolving directory' },
	{ copy: 'function resolving path' },
	{ copy: 'function resolving directory' },
	{ copy: 'function resolving promise resolving path' },
	{ copy: 'function resolving promise resolving directory' },
	{ copy: 'function resolving function resolving path' },
	{ copy: 'function resolving function resolving directory' }
];

writerPossibilities.forEach(possibility => {
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

	if (true) {}
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

	if(writeType === 'directory'){
		return true;
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

			if(copyType === 'directory'){
				callback(null, path.dirname(originalPath));return;
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
				let expectedContent = `${id} => ${title} -- file content`;

				getWriterOptions(expectedContent, writerOptions => {
					const writer = new FileWriter(writerOptions);
					const exploded = (write || copy).split(' ');
					if (exploded[exploded.length - 1] === 'directory') {
						expectedContent = true;
					}

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

		const title_promise_unexistent_path = `writeTo using ${write ? 'write' : 'copy'} with ${write || copy} (unexistent path)`;
		writeToTest(title_promise_unexistent_path, (directory, writer, expectedFile, expectedContent, t) => {
			const writeToPromise = writer.writeTo(directory.join('unexistent/path/to', expectedFile));

			assert(writeToPromise instanceof Promise);

			writeToPromise.then(()=>{
				directory.assertAllFilesExist([{
					path: path.join('unexistent/path/to', expectedFile),
					content: expectedContent
				}]).then(()=>{t.pass();t.end()});
			});
		});

		const title_cb_unexistent_path = `${title_promise_unexistent_path} - callback style`;
		writeToTest(title_cb_unexistent_path, (directory, writer, expectedFile, expectedContent, t) => {
			const writeToResult = writer.writeTo(directory.join('unexistent/path/to', expectedFile), err => {
				assert(!err);

				directory.assertAllFilesExist([{
					path: path.join('unexistent/path/to', expectedFile),
					content: expectedContent
				}]).then(()=>{t.pass();t.end()});
			});

			assert.equal(writeToResult, null);
		});
	});
}

testWriteToPossibilities(writerPossibilities);

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
							mkdir(dirPath, mode, cb){cb()},
							stat(destPath, cb){cb()},
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

function testDependenciesThrowingAnError(possibilities) {
	const FileWriter = requireFromIndex('sources/file-writer');

	possibilities.forEach(({
		write = null,
		copy = null
	}) => {
		const throwingErrorDependencies = write ? ['mkdirp'] : ['mkdirp', 'isDirectory'];

		throwingErrorDependencies.forEach(dep => {
			function getWriterOptions(expectedContent, callback) {
				write ? callback({ write: getWriteValue(write, expectedContent) }) : getCopyValue(copy, expectedContent, (err, original) => {
					if (err) {throw err;}
					callback({ copy : original })
				});
			}

			function throwingErrorDependenciesTest(title, testCallback){
				test.cb(title, t => {
					const id = possibilityTestIdentifier();
					const expectedFile = `${dashify(title)}.txt`;
					let expectedContent = `${id} => ${title} -- file content`;

					t.plan(1);

					getWriterOptions(expectedContent, writerOptions => {
						const writer = new FileWriter(writerOptions);
						const exploded = (write || copy).split(' ');
						if (exploded[exploded.length - 1] === 'directory') {
							expectedContent = true;
						}

						createMockDirectory(title).then(directory => {
							testCallback(directory, writer, expectedFile, t);
						}).catch(err => {throw err});
					})
				});
			}

			function getThrowingErrorDependency() {
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

			const title_promise = `writeTo using ${write ? 'write' : 'copy'} with ${write || copy} and the dependency "${dep}" throwing an error`;
			throwingErrorDependenciesTest(title_promise, (directory, writer, expectedFile, t) => {
				const writeToPromise = writer.writeTo(directory.join(expectedFile), null, getThrowingErrorDependency());

				assert(writeToPromise instanceof Promise);

				writeToPromise.then(()=>{t.fail();}).catch(err=>{
					assert.equal(err.message, `${dep} dependency error`);

					directory.assertAllFilesExist([{
						path: expectedFile,
						content: false
					}]).then(()=>{t.pass();t.end()});
				});
			});

			const title_callback = `${title_promise} - callback style`
			throwingErrorDependenciesTest(title_callback, (directory, writer, expectedFile, t) => {
				const writeToResult = writer.writeTo(directory.join(expectedFile), err => {
					assert(err);
					assert.equal(err.message, `${dep} dependency error`);

					directory.assertAllFilesExist([{
						path: expectedFile,
						content: false
					}]).then(()=>{t.pass();t.end()});
				}, getThrowingErrorDependency());

				assert.equal(writeToResult, null);
			});
		});
	});
}

testDependenciesThrowingAnError(writerPossibilities);