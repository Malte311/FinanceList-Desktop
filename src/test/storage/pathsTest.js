const assert = require('assert');
const Path = require(__dirname + '/../../app/scripts/storage/paths.js');
const JsonStorage = require(__dirname + '/../../app/scripts/storage/jsonStorage.js');

const {appendFileSync, existsSync, rmdirSync, unlinkSync} = require('fs');

describe('Path', function() {
	let sep = Path.sep();

	describe('#getSettingsFilePath()', function() {
		it('settings file should be in the storage directory', function() {
			let settingsFilePath = Path.getStoragePath() + Path.sep() + 'settings.json';
			assert.strictEqual(settingsFilePath, Path.getSettingsFilePath());
		});
	});
	
	describe('#createPath()', function() {
		it('should create a single folder', function() {
			let path = `/tmp${sep}financelist${sep}thisIsSomeTest${sep}`;
			assert.strictEqual(existsSync(path), false, 'path should not exist before creating it');

			Path.createPath(path);
			assert.strictEqual(existsSync(path), true, 'path should exist after creating it');
			
			rmdirSync(path, {recursive: true});
			assert.strictEqual(existsSync(path), false, 'path should be cleaned up after the test');
		});
		
		it('should create a complete path', function() {
			let path = `/tmp${sep}financelist${sep}thisIsSomeTest${sep}with${sep}sub${sep}dirs${sep}`;
			assert.strictEqual(existsSync(path), false, 'path should not exist before creating it');

			Path.createPath(path);
			assert.strictEqual(existsSync(path), true, 'path should exist after creating it');
			
			rmdirSync(`/tmp${sep}financelist${sep}thisIsSomeTest`, {'recursive': true});
			assert.strictEqual(existsSync(path), false, 'path should be cleaned up after the test');
		});
	});

	describe('#moveJsonFiles()', function() {
		it('should move all json files to the given location', function() {
			let path = new Path(new JsonStorage());

			// ==>
		});
	});

	describe('#listJsonFiles()', function() {
		it('should return an empty array when no files exist', function() {
			assert.deepStrictEqual(Path.listJsonFiles(__dirname), []);
		});

		it('should list multiple files', function() {
			appendFileSync('/tmp/financelist/testA.json', JSON.stringify([]), {encoding: 'utf-8'});
			appendFileSync('/tmp/financelist/testB.json', JSON.stringify([]), {encoding: 'utf-8'});
			appendFileSync('/tmp/financelist/testC.json', JSON.stringify([]), {encoding: 'utf-8'});
			
			assert.deepStrictEqual(Path.listJsonFiles('/tmp/financelist'), ['testA.json', 'testB.json', 'testC.json']);

			unlinkSync('/tmp/financelist/testA.json');
			unlinkSync('/tmp/financelist/testB.json');
			unlinkSync('/tmp/financelist/testC.json');
		});
	});
});