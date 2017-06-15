'use strict';

const fs = require('fs');

const intoStream = require('into-stream');

const requireFromIndex = require('../utils/require-from-index');
const createTestDirectory = require('../utils/create-test-directory');

const mockFileWriter = require('./mock-file-writer');

const generate = requireFromIndex('sources/generate');

function mockGenerateConfigObjectKeyValue(valueType, content, configCallback) {
	if(valueType === 'content as string'){
		configCallback(content);
		return;
	}

	if(valueType === 'true for directory'){
		configCallback(true);
		return;
	}

	if(valueType === 'buffer'){
		configCallback(Buffer.from(content));
		return;
	}

	if(valueType === 'stream'){
		configCallback(intoStream(content));
		return;
	}

	if (valueType === 'instance of FileWriter') {
		configCallback(new mockFileWriter());
		return;
	}

	if (valueType === 'generate.write()') {
		configCallback(generate.write(content));
		return;
	}

	if (valueType === 'generate.copy()') {
		createTestDirectory({
			title: 'generate-copy-mock'
		}, directory => {
			const fileToCopy = directory.join('generate-copy-mock-file.txt');

			fs.writeFile(fileToCopy, content, err => {
				if(err){throw err;return;}

				configCallback(generate.copy(fileToCopy));
			});
		});

		return;
	}

	throw new Error(`mockGenerateConfigObjectKeyValue: ${valueType} is not a handled type`)
}

module.exports = mockGenerateConfigObjectKeyValue;