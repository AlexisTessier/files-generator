'use strict';

const randomstring = require("randomstring");

function mockFileContent(){
	return `file-content-${randomstring.generate()}`;
}

module.exports = mockFileContent;