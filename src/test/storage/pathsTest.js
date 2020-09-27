const assert = require('assert');
const Path = require(__dirname + '/../../app/scripts/storage/paths.js');

describe('Path', function() {
	let fs = require('fs');
	let sep = Path.sep();

	describe('#getSettingsFilePath()', function() {
		it('settings file should be in the storage directory', function() {
			let settingsFilePath = Path.getStoragePath() + Path.sep() + 'settings.json';
			assert.strictEqual(settingsFilePath, Path.getSettingsFilePath());
		});
	});
	
	describe('#createPath()', function() {
		it('should create a single folder', function() {
			let path = `${__dirname}${sep}thisIsSomeTest${sep}`;
			assert.strictEqual(fs.existsSync(path), false, 'path should not exist before creating it');

			Path.createPath(path);
			assert.strictEqual(fs.existsSync(path), true, 'path should exist after creating it');
			
			fs.rmdirSync(path);
			assert.strictEqual(fs.existsSync(path), false, 'path should be cleaned up after the test');
		});
		
		it('should create a complete path', function() {
			let path = `${__dirname}${sep}thisIsSomeTest${sep}with${sep}sub${sep}dirs${sep}`;
			assert.strictEqual(fs.existsSync(path), false, 'path should not exist before creating it');

			Path.createPath(path);
			assert.strictEqual(fs.existsSync(path), true, 'path should exist after creating it');
			
			fs.rmdirSync(`${__dirname}${sep}thisIsSomeTest`, {'recursive': true});
			assert.strictEqual(fs.existsSync(path), false, 'path should be cleaned up after the test');
		});
	});
});