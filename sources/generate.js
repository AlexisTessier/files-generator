'use strict';

const path = require('path');
const assert = require('better-assert');

const listenableEvents = [
	'write', 'finish', 'error'
];

function generate() {
	const listeners = [];

	function emit(eventToEmit, ...args) {
		listeners.filter(({event}) => event === eventToEmit).forEach(({listener})=>listener(...args))
	}

	function on(event, listener) {
		listeners.push({event, listener});
	};

	function off() {
	};

	function generateInstance(generateConfig){
		process.nextTick(()=>{
			emit('finish');
		});
	}

	return Object.assign(generateInstance, {
		on, off, listenableEvents
	});
}

module.exports = generate;