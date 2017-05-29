'use strict';

const assert = require('better-assert');

const shell = require('shelljs');

const pkg = require('../package.json');
const git = require('git-repo-info');

shell.exec(`git checkout release`);
assert(git().branch === 'release');

if(shell.exec(`git pull origin release`).code !== 0) {
	shell.echo('Error: Release failed at update release branch');
	shell.exit(1);
}

shell.exec(`git checkout master`);
assert(git().branch === 'master');

if(shell.exec(`git pull origin master`).code !== 0) {
	shell.echo('Error: Release failed at update master branch');
	shell.exit(1);
}
else if(shell.exec(`git merge release`).code !== 0) {
	shell.echo('Error: Release failed at master update merging release');
	shell.exit(1);
}
else if (shell.exec(`npm run build`).code !== 0) {
	shell.echo('Error: Release build failed on master');
	shell.exit(1);
}
else if(shell.exec(`npm test`).code !== 0) {
	shell.echo('Error: Release Tests failed on master');
	shell.exit(1);
}
else if(shell.exec(`git add . && git commit -a -m "Auto-commit : pre-release ${pkg.version}"`).code !== 0) {
	shell.echo('Error: Release failed at pre-release commit');
	shell.exit(1);
}
else if(shell.exec(`git push origin master`).code !== 0) {
	shell.echo('Error: Release failed at push on master');
	shell.exit(1);
}

shell.exec(`git checkout release`);
assert(git().branch === 'release');

if (shell.exec(`git merge master`).code !== 0) {
	shell.echo('Error: Release failed at merge master step');

	shell.exec(`git checkout master`);
	assert(git().branch === 'master');

	shell.exit(1);
}
else if (shell.exec(`npm run build`).code !== 0) {
	shell.echo('Error: Release build failed');

	shell.exec(`git checkout master`);
	assert(git().branch === 'master');

	shell.exit(1);
}
else if(shell.exec(`npm test`).code !== 0) {
	shell.echo('Error: Release Tests failed');

	shell.exec(`git checkout master`);
	assert(git().branch === 'master');

	shell.exit(1);
}
else if(shell.exec(`git add . && git commit -a -m "Auto-commit : release ${pkg.version}"`).code !== 0) {
	shell.echo('Error: Release failed at release commit');

	shell.exec(`git checkout master`);
	assert(git().branch === 'master');

	shell.exit(1);
}
else if(shell.exec(`git push origin release`).code !== 0){
	shell.echo('Error: Release failed at push on release');
	shell.exit(1);
}

shell.exec(`git checkout master`);
assert(git().branch === 'master');