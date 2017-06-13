'use strict';

const mockFileWriterWriteOptionValue = require('./mock-file-writer-write-option-value');
const mockFileWriterCopyOptionValue = require('./mock-file-writer-copy-option-value');

function mockFileWriterOptionsObject({
	write = null,
	copy = null
}, stringContent, callback) {
	if ((!write && !copy) || !!write === !!copy) {
		throw new Error('Please provide a write value or a copy value');
	}

	if (write) {
		mockFileWriterWriteOptionValue(write, stringContent, writeOptionValue => {
			callback({ write : writeOptionValue }, null);
		});
	}
	else{
		mockFileWriterCopyOptionValue(copy, stringContent, (copyOptionValue, pathToCopy) => {
			callback({ copy : copyOptionValue }, pathToCopy);
		});
	}
}

module.exports = mockFileWriterOptionsObject;