'use strict';

const fs = require('fs');
const path = require('path');

const dashify = require('dashify');
const createTestDirectory = require('../utils/create-test-directory');

function mockFileWriterCopyOptionValue(copyType, stringContent, copyMockCallback) {
	createTestDirectory({
		title: dashify(stringContent)
	}, directory => {
		const originalPath = directory.join(`${dashify(copyType+stringContent)}.txt`);

		fs.writeFile(originalPath, stringContent, {encoding: 'utf-8'}, err => {
			if (err) {throw err;return;}

			copyType = copyType.trim();

			if(copyType === 'path'){
				copyMockCallback(originalPath, originalPath);
				return;
			}

			if(copyType === 'directory'){
				copyMockCallback(path.dirname(originalPath), path.dirname(originalPath));
				return;
			}

			if (copyType.indexOf('promise resolving') === 0) {
				mockFileWriterCopyOptionValue(copyType.replace('promise resolving', ''), stringContent, (resolveValue, pathToCopy) => {
					copyMockCallback(new Promise(_resolve => setTimeout(()=>_resolve(resolveValue), 50)), pathToCopy);
				});
				return;
			}

			if (copyType.indexOf('function resolving') === 0) {
				mockFileWriterCopyOptionValue(copyType.replace('function resolving', ''), stringContent, (resolveValue, pathToCopy) => {
					copyMockCallback(cb => {
						setTimeout(()=>{
							cb(null, resolveValue)
						}, 50);
					}, pathToCopy);
				});
				return;
			}

			throw new Error(`unhandled copyType "${copyType}" for content "${stringContent}"`);
		});
	});
}

module.exports = mockFileWriterCopyOptionValue;