const assert = require('assert');
const JsonStorage = require(__dirname +  '/../../app/scripts/storage/jsonStorage.js');
const Path = require(__dirname + '/../../app/scripts/storage/paths.js');

const {appendFileSync, existsSync, mkdirSync, rmdirSync, unlinkSync} = require('fs');

describe('Path', function() {
	let sep = Path.sep();

	before(function() {		
		if (!existsSync('/tmp/financelist/')) {
			mkdirSync('/tmp/financelist/');
		}
	});

	after(function() {		
		if (existsSync('/tmp/financelist/')) {
			rmdirSync('/tmp/financelist/', {recursive: true});
		}
	});

	describe('#home()', function() {
		it('should use the tmp directory', function() {
			assert.strictEqual(Path.home(), '/tmp/financelist');
		});
	});

	describe('#getStoragePath()', function() {
		it('should return the storage subfolder of Path.home()', function() {
			assert.strictEqual(Path.getStoragePath(), Path.home() + Path.sep() + 'storage');
		});
	});

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
		let jsonStorage = new JsonStorage();

		it('should move all json files to the given location', function() {
			appendFileSync('/tmp/financelist/testA.json', JSON.stringify([]), {encoding: 'utf-8'});
			appendFileSync('/tmp/financelist/testB.json', JSON.stringify([]), {encoding: 'utf-8'});
			appendFileSync('/tmp/financelist/testC.json', JSON.stringify([]), {encoding: 'utf-8'});

			mkdirSync('/tmp/financelist/movetest');

			Path.moveJsonFiles('/tmp/financelist', '/tmp/financelist/movetest', jsonStorage, () => {});
			assert.deepStrictEqual(Path.listJsonFiles('/tmp/financelist/movetest'), ['testA.json', 'testB.json', 'testC.json']);
			assert.deepStrictEqual(Path.listJsonFiles('/tmp/financelist'), []);

			Path.moveJsonFiles('/tmp/financelist/movetest', '/tmp/financelist', jsonStorage, () => {}); // Move back
			assert.deepStrictEqual(Path.listJsonFiles('/tmp/financelist'), ['testA.json', 'testB.json', 'testC.json']);
			assert.deepStrictEqual(Path.listJsonFiles('/tmp/financelist/movetest'), []);

			rmdirSync('/tmp/financelist/movetest', {recursive: true});

			['/tmp/financelist/testA.json', '/tmp/financelist/testB.json', '/tmp/financelist/testC.json'].forEach(f => {
				if (existsSync(f)) {
					unlinkSync(f);
				}
			});
		});

		it('should move user directories with their content', function() {
			mkdirSync('/tmp/financelist/testuser');
			mkdirSync('/tmp/financelist/testuser2');

			appendFileSync('/tmp/financelist/testuser/testA.json', JSON.stringify([]), {encoding: 'utf-8'});
			appendFileSync('/tmp/financelist/testuser2/testB.json', JSON.stringify([]), {encoding: 'utf-8'});
			appendFileSync('/tmp/financelist/testuser2/testC.json', JSON.stringify([]), {encoding: 'utf-8'});
			// settings.json should never be moved
			appendFileSync('/tmp/financelist/settings.json', JSON.stringify([]), {encoding: 'utf-8'});

			mkdirSync('/tmp/financelist/movetest');
			jsonStorage.storePreference('users', ['testuser', 'testuser2']);

			Path.moveJsonFiles('/tmp/financelist', '/tmp/financelist/movetest', jsonStorage, () => {});
			assert.deepStrictEqual(Path.listJsonFiles('/tmp/financelist/movetest/testuser/'), ['testA.json']);
			assert.deepStrictEqual(Path.listJsonFiles('/tmp/financelist/movetest/testuser2/'), ['testB.json', 'testC.json']);
			assert.deepStrictEqual(Path.listJsonFiles('/tmp/financelist'), ['settings.json']);
			assert.deepStrictEqual(Path.listJsonFiles('/tmp/financelist/movetest'), []);

			unlinkSync('/tmp/financelist/settings.json');
			rmdirSync('/tmp/financelist/movetest', {recursive: true});
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