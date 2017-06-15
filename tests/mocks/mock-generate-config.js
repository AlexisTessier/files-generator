'use strict';

const mockGenerateConfigObjectKeyValue = require('./mock-generate-config-object-key-value');

function mockGenerateConfig(configSchema, configCallback) {
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

		actualConfig[filePath] = mockGenerateConfigObjectKeyValue(entry.type, entry.content);

		if (entry.type === 'instance of FileWriter') {
			configFileWriters.push({
				writer: actualConfig[filePath],
				destinationPath: filePath
			});
		}

		checkedCount++;poll();
	}
}

module.exports = mockGenerateConfig;