'use strict';

let fileNameCount = 0;
function mockGenerateConfigObjectKeyName({
	depth = (fileNameCount++),
	directory = false
} = {}){
	const ext = directory === 'directory' ? '' : '.txt';

	if (depth % 3 === 0) {
		return `mock-folder-name-${fileNameCount}/mock-subfolder-name-${fileNameCount}/mock-file-name-${fileNameCount}${ext}`;
	}

	if (depth % 2 === 0) {
		return `mock-folder-name-${fileNameCount}/mock-file-name-${fileNameCount}${ext}`;
	}
	
	return `mock-file-name-${fileNameCount}${ext}`;
}

module.exports = mockGenerateConfigObjectKeyName;