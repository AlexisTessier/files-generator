'use strict';

const path = require('path');

const assert = require('better-assert');

const mockGenerateConfigObjectKeyValue = require('./mock-generate-config-object-key-value');

function mockGenerateConfig(configSchema, parentFilePath, configCallback) {
	assert(typeof configSchema === 'object');
	assert(typeof parentFilePath === 'string' || !parentFilePath);
	assert(typeof configCallback === 'function');

	const actualConfig = {};
	const configFileWriters = [];

	const toCheckCount = Object.keys(configSchema).length;
	let checkedCount = 0;

	function poll(){
		if (checkedCount >= toCheckCount) {
			configCallback(actualConfig, configFileWriters);
		}
	}

	poll();

	for(const filePath in configSchema){
		const entry = configSchema[filePath];

		const fullFilePath = parentFilePath ? path.join(parentFilePath, filePath) : filePath;

		mockGenerateConfigObjectKeyValue(entry.type, entry.content, fullFilePath, mockGenerateConfig, (configValue, nestedConfigFileWriters = []) => {
			actualConfig[filePath] = configValue;

			configFileWriters.push(...nestedConfigFileWriters);

			if (entry.type === 'instance of FileWriter') {
				configFileWriters.push({
					writer: actualConfig[filePath],
					destinationPath: fullFilePath
				});
			}

			checkedCount++;poll();
		});
	}
}

module.exports = mockGenerateConfig;