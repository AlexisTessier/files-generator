'use strict';

const path = require('path');

const assert = require('better-assert');
const temp = require('temp');
const copy = require('recursive-copy');

const assertAllFilesExist = require('./assert-all-files-exist');

temp.track();

module.exports = function createTestDirectory({
	title,
	relative = false,
	template = null
}, createTestDirectoryCallback) {
	assert(typeof title === 'string' && title.length >= 2);
	assert(!template || (typeof template === 'string' && template.length >= 2));

	temp.mkdir(title, (err, directoryPath)=>{
		if (err) {throw err;return;}

		directoryPath = relative ? path.relative(process.cwd(), directoryPath) : directoryPath;

		function createTestDirectoryCallbackRun() {
			createTestDirectoryCallback({
				absolutePath: relative ? path.join(process.cwd(), directoryPath) : directoryPath,
				path: directoryPath,
				join: (...p) => path.join(directoryPath, ...p),
				assertAllFilesExist (expectedFiles, cb){
					assert(Array.isArray(expectedFiles));

					assertAllFilesExist(expectedFiles.map(file => ({
						path: path.join(directoryPath, file.path),
						content: file.content,
						relative: file.relative
					})), cb);
				},
			})
		}

		if (template) {
			const templatePath = path.join(__dirname, `test-directory-templates/${template}`);

			copy(templatePath, directoryPath, err => {
				if (err) {throw err;return;}

				createTestDirectoryCallbackRun();
			});
		}
		else{
			createTestDirectoryCallbackRun();
		}
	});
}