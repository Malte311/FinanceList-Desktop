const assert = require('assert');
const JsonStorage = require('../../app/scripts/storage/jsonStorage.js');

describe('JsonStorage', function() {
	let jsonStorage = new JsonStorage();
	let fs = jsonStorage.fs;
	let sep = jsonStorage.path.sep;
	
	describe('#createPath()', function() {
		it('should create a single folder', function() {
			let path = `${__dirname}${sep}thisIsSomeTest${sep}`;
			assert.equal(fs.existsSync(path), false, 'path should not exist before creating it');

			jsonStorage.createPath(path);
			assert.equal(fs.existsSync(path), true, 'path should exist after creating it');
			
			fs.rmdirSync(path);
			assert.equal(fs.existsSync(path), false, 'path should be cleaned up after the test');
		});
		
		it('should create a complete path', function() {
			let path = `${__dirname}${sep}thisIsSomeTest${sep}with${sep}sub${sep}dirs${sep}`;
			assert.equal(fs.existsSync(path), false, 'path should not exist before creating it');

			jsonStorage.createPath(path);
			assert.equal(fs.existsSync(path), true, 'path should exist after creating it');
			
			fs.rmdirSync(`${__dirname}${sep}thisIsSomeTest`, {'recursive': true});
			assert.equal(fs.existsSync(path), false, 'path should be cleaned up after the test');
		});
	});
});