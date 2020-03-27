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
});