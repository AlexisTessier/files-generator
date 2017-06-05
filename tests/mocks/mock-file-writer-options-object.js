'use strict';

const mockFileWriterWriteOptionValue = require('./mock-file-writer-write-option-value');
const mockFileWriterCopyOptionValue = require('./mock-file-writer-copy-option-value');

function mockFileWriterOptionsObject({
	write = null,
	copy = null
}, expectedContent, callback) {
	if ((!write && !copy) || !!write === !!copy) {
		throw new Error('Please provide a write value or a copy value');
	}

	if (write) {
		mockFileWriterWriteOptionValue(write, expectedContent, writeOptionValue => {
			callback({ copy : writeOptionValue }, null);
		});
	}
	else{
		mockFileWriterCopyOptionValue(copy, expectedContent, (copyOptionValue, pathToCopy) => {
			callback({ copy : copyOptionValue }, pathToCopy);
		});
	}
}

module.exports = mockFileWriterOptionsObject;