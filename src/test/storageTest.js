const assert = require('assert');
const storage = require('../app/scripts/storage.js');

describe('JsonStorage', function() {
	let fs = require('fs');
	let sep = require('path').sep;
	let jsonStorage = new storage.JsonStorage();
	
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

// describe('Localstorage', function() {
// 	describe('', function() {

// 	});
// });