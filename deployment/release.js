'use strict';

const assert = require('better-assert');

const shell = require('shelljs');

const pkg = require('../package.json');
const git = require('git-repo-info');

shell.exec(`git checkout master`);

assert(git().branch === 'master');

shell.exec(`git merge release && git push origin master`);

shell.exec(`git checkout release`);

assert(git().branch === 'release');

if (shell.exec(`git merge -s ours master`).code !== 0) {
	shell.echo('Error: Release failed at merge master step');
	shell.exit(1);
}
else if (shell.exec(`npm run build`).code !== 0) {
	shell.echo('Error: Release build failed');
	shell.exit(1);
}
else if(shell.exec(`npm test`).code !== 0) {
	shell.echo('Error: Release Tests failed');
	shell.exit(1);
}
else{
	//add the generated files which are different depending on the branch (like README.md)
	shell.exec(`git add . && git commit -a -m "Auto-commit : release ${pkg.version}"`);

	//then
	shell.exec(`git push origin release`);
}

shell.exec(`git checkout master`);

assert(git().branch === 'master');