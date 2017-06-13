'use strict';

const intoStream = require('into-stream');

function mockFileWriterWriteOptionValue(writeType, stringContent, writeMockCallback) {
	writeType = writeType.trim();

	if (writeType === 'failing function') {
		writeMockCallback(
			callback => setTimeout(()=>callback(new Error('mock failing function error')), 50)
		)
		return;
	}

	if (writeType === 'failing promise') {
		writeMockCallback(
			new Promise((resolve, reject) => setTimeout(()=>reject(new Error('mock failing promise error')), 50))
		);
		return;
	}

	if(writeType === 'string'){
		writeMockCallback(stringContent);
		return;
	}

	if(writeType === 'directory'){
		writeMockCallback(true);
		return;
	}

	if(writeType === 'buffer'){
		writeMockCallback(Buffer.from(stringContent));
		return;
	}

	if(writeType === 'stream'){
		writeMockCallback(intoStream(stringContent));
		return;
	}

	if (writeType.indexOf('promise resolving') === 0) {
		mockFileWriterWriteOptionValue(writeType.replace('promise resolving', ''), stringContent, resolveValue => {
			writeMockCallback(new Promise(resolve => setTimeout(()=>resolve(resolveValue), 50)));
		});
		return;
	}

	if (writeType.indexOf('function resolving') === 0) {
		mockFileWriterWriteOptionValue(writeType.replace('function resolving', ''), stringContent, resolveValue => {
			writeMockCallback(cb => {
				setTimeout(()=>{
					cb(null, resolveValue)
				}, 50);
			});
		});
		return;
	}

	throw new Error(`unhandled writeType "${writeType}" for content "${stringContent}"`);
}

module.exports = mockFileWriterWriteOptionValue;