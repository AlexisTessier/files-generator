'use strict';

const path = require('path');

const assert = require('better-assert');
const temp = require('temp');
const copy = require('recursive-copy');

const assertAllFilesExist = require('./assert-all-files-exist');
const mockDirectoryTemplatePath = require('./mock-directory-template-path');

temp.track();

module.exports = function createMockDirectory(title, template) {
	assert(typeof title === 'string' && title.length >= 2);
	assert(!template || (typeof template === 'string' && template.length >= 2));

	return new Promise((resolve, reject) => {
		temp.mkdir(title, (err, directoryPath)=>{
			if (err) {reject(err);return;}

			function runResolve() {
				resolve({
					path: directoryPath,
					join: (...p) => path.join(directoryPath, ...p),
					assertAllFilesExist (expectedFiles){
						assert(Array.isArray(expectedFiles));

						return assertAllFilesExist(expectedFiles.map(file => ({
							path: path.join(directoryPath, file.path),
							content: file.content
						})));
					},
				})
			}

			if (template) {
				const templatePath = mockDirectoryTemplatePath(template);

				copy(templatePath, directoryPath, err => {
					if (err) {reject(err);return;}

					runResolve();
				});
			}
			else{
				runResolve();
			}
		});
	});
}