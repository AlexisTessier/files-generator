'use strict';

const writerPossibilities = [
	{ write: 'string' },
	{ write: 'buffer' },
	{ write: 'stream' },
	{ write: 'directory' },
	{ write: 'promise resolving string' },
	{ write: 'promise resolving buffer' },
	{ write: 'promise resolving stream' },
	{ write: 'promise resolving directory' },
	{ write: 'promise resolving function resolving string' },
	{ write: 'promise resolving function resolving buffer' },
	{ write: 'promise resolving function resolving stream' },
	{ write: 'promise resolving function resolving directory' },
	{ write: 'promise resolving promise resolving string' },
	{ write: 'promise resolving promise resolving buffer' },
	{ write: 'promise resolving promise resolving stream' },
	{ write: 'promise resolving promise resolving directory' },
	{ write: 'promise resolving promise resolving function resolving string' },
	{ write: 'promise resolving promise resolving function resolving buffer' },
	{ write: 'promise resolving promise resolving function resolving stream' },
	{ write: 'promise resolving promise resolving function resolving directory' },
	{ write: 'function resolving string' },
	{ write: 'function resolving buffer' },
	{ write: 'function resolving stream' },
	{ write: 'function resolving directory' },
	{ write: 'function resolving promise resolving string' },
	{ write: 'function resolving promise resolving buffer' },
	{ write: 'function resolving promise resolving stream' },
	{ write: 'function resolving promise resolving directory' },
	{ write: 'function resolving function resolving string' },
	{ write: 'function resolving function resolving buffer' },
	{ write: 'function resolving function resolving stream' },
	{ write: 'function resolving function resolving directory' },
	{ write: 'function resolving promise resolving function resolving string' },
	{ write: 'function resolving promise resolving function resolving buffer' },
	{ write: 'function resolving promise resolving function resolving stream' },
	{ write: 'function resolving promise resolving function resolving directory' },
	{ copy: 'path' },
	{ copy: 'directory' },
	{ copy: 'promise resolving path' },
	{ copy: 'promise resolving directory' },
	{ copy: 'promise resolving function resolving path' },
	{ copy: 'promise resolving function resolving directory' },
	{ copy: 'promise resolving promise resolving path' },
	{ copy: 'promise resolving promise resolving directory' },
	{ copy: 'function resolving path' },
	{ copy: 'function resolving directory' },
	{ copy: 'function resolving promise resolving path' },
	{ copy: 'function resolving promise resolving directory' },
	{ copy: 'function resolving function resolving path' },
	{ copy: 'function resolving function resolving directory' }
];

writerPossibilities.forEach(possibility => {
	const action = (possibility.write || possibility.copy);
	const exploded = action.split(' ');
	const last = exploded[exploded.length - 1];

	if (last === 'string' || last === 'buffer') {
		possibility.dependencies = ['fs.writeFile'];
	}

	if (last === 'stream') {
		possibility.dependencies = ['fs.createWriteStream'];
	}

	if (last === 'path') {
		possibility.dependencies = ['fs.createReadStream', 'fs.createWriteStream'];
	}

	if (last === 'directory') {
		possibility.dependencies = [];
	}
});

module.exports = writerPossibilities;