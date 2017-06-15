'use strict';

let fileNameCount = 0;
function mockGenerateConfigObjectKeyName(){
	fileNameCount++;

	if (fileNameCount % 3 === 0) {
		return `mock-folder-name-${fileNameCount}/mock-subfolder-name-${fileNameCount}/mock-file-name-${fileNameCount}.txt`;
	}

	if (fileNameCount % 2 === 0) {
		return `mock-folder-name-${fileNameCount}/mock-file-name-${fileNameCount}.txt`;
	}
	
	return `mock-file-name-${fileNameCount}.txt`;
}

module.exports = mockGenerateConfigObjectKeyName;