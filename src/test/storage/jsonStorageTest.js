const assert = require('assert');
const JsonStorage = require(__dirname + '/../../app/scripts/storage/jsonStorage.js');

describe('JsonStorage', function() {
	let jsonStorage = new JsonStorage();

	describe('#readPreference()', function() {
		it('should be overriden and therefore not throw an error', function() {
			assert.doesNotThrow(() => { jsonStorage.readPreference('language'); }, Error);
		});
	});

	describe('#storePreference()', function() {
		it('should be overriden and therefore not throw an error', function() {
			assert.doesNotThrow(() => {
				let lang = jsonStorage.readPreference('language');
				jsonStorage.storePreference('language', lang); // Keep the current language.
			}, Error);
		});
	});

	describe('#readMainStorage()', function() {
		it('should be overriden and therefore not throw an error', function() {
			assert.doesNotThrow(() => { jsonStorage.readMainStorage('budgets'); }, Error);
		});
	});

	describe('#writeMainStorage()', function() {
		it('should be overriden and therefore not throw an error', function() {
			assert.doesNotThrow(() => {
				let budgets = jsonStorage.readMainStorage('budgets');
				jsonStorage.writeMainStorage('budgets', budgets);
			}, Error);
		});
	});

	describe('#getCurrentFileName()', function() {
		it('should return the correct file name for today', function() {
			let today = new Date();
			let year = today.getFullYear();
			let month = (today.getMonth() + 1).toString().padStart(2, '0'); // Zero indexed.
			
			let fNameToday = `${month}.${year}.json`;
			assert.equal(jsonStorage.getCurrentFileName(), fNameToday);
		});
	});
});