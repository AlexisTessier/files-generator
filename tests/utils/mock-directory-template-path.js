'use strict';

const assert = require('better-assert');
const pathFromIndex = require('./path-from-index');

module.exports = function mockDirectoryTemplatePath(template) {
	assert(typeof template === 'string');

	return pathFromIndex('tests/mocks/directory', template);
}