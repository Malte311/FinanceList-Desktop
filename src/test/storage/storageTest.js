const assert = require('assert');
const Storage = require(__dirname + '/../../app/scripts/storage/storage.js');

describe('Storage', function() {
	let storage = new Storage();

	describe('#readPreference()', function() {
		it('should throw an error because it should be overridden', function() {
			assert.throws(storage.readPreference, Error);
		});
	});

	describe('#storePreference()', function() {
		it('should throw an error because it should be overridden', function() {
			assert.throws(storage.storePreference, Error);
		});
	});

	describe('#readMainStorage()', function() {
		it('should throw an error because it should be overridden', function() {
			assert.throws(storage.readMainStorage, Error);
		});
	});

	describe('#writeMainStorage()', function() {
		it('should throw an error because it should be overridden', function() {
			assert.throws(storage.writeMainStorage, Error);
		});
	});

	describe('#addToMainStorageArr()', function() {
		it('should throw an error because it calls intern functions which should be overridden', function() {
			assert.throws(storage.addToMainStorageArr, Error);
		});
	});

	describe('#getData()', function() {
		it('should throw an error because it should be overridden', function() {
			assert.throws(storage.getData, Error);
		});
	});

	describe('#storeData()', function() {
		it('should throw an error because it should be overridden', function() {
			assert.throws(storage.storeData, Error);
		});
	});

	describe('#replaceData()', function() {
		it('should throw an error because it should be overridden', function() {
			assert.throws(storage.replaceData, Error);
		});
	});

	describe('#deleteData()', function() {
		it('should throw an error because it should be overridden', function() {
			assert.throws(storage.deleteData, Error);
		});
	});
});