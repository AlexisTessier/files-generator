'use strict';

const intoStream = require('into-stream');

const mockFileWriter = require('./mock-file-writer');

function mockGenerateConfigObjectKeyValue(valueType, content) {
	if(valueType === 'content as string'){
		return content;
	}

	if(valueType === 'true for directory'){
		return true
	}

	if(valueType === 'buffer'){
		return Buffer.from(content)
	}

	if(valueType === 'stream'){
		return intoStream(content)
	}

	if (valueType === 'instance of FileWriter') {
		return new mockFileWriter();
	}

	throw new Error(`mockGenerateConfigObjectKeyValue: ${valueType} is not a handled type`)
}

module.exports = mockGenerateConfigObjectKeyValue;