'use strict';

let fileNameCount = 0;
function mockGenerateConfigObjectKeyName(directory = false){
	fileNameCount++;

	const ext = directory === 'directory' ? '' : '.txt';

	if (fileNameCount % 3 === 0) {
		return `mock-folder-name-${fileNameCount}/mock-subfolder-name-${fileNameCount}/mock-file-name-${fileNameCount}${ext}`;
	}

	if (fileNameCount % 2 === 0) {
		return `mock-folder-name-${fileNameCount}/mock-file-name-${fileNameCount}${ext}`;
	}
	
	return `mock-file-name-${fileNameCount}${ext}`;
}

module.exports = mockGenerateConfigObjectKeyName;