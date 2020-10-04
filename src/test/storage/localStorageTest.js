const assert = require('assert');
const LocalStorage = require(__dirname + '/../../app/scripts/storage/localStorage.js');

describe('LocalStorage', function() {
	let localStorage = new LocalStorage();

	describe('#readPreference()', function() {
		it('should be overriden and therefore not throw an error', function() {
			assert.doesNotThrow(() => { localStorage.readPreference('language'); }, Error);
		});
	});

	describe('#storePreference()', function() {
		it('should be overriden and therefore not throw an error', function() {
			assert.doesNotThrow(() => {
				let lang = localStorage.readPreference('language');
				localStorage.storePreference('language', lang); // Keep the current language.
			}, Error);
		});
	});

	describe('#readMainStorage()', function() {
		it('should be overriden and therefore not throw an error', function() {
			assert.doesNotThrow(() => { localStorage.readMainStorage('budgets'); }, Error);
		});
	});

	describe('#writeMainStorage()', function() {
		it('should be overriden and therefore not throw an error', function() {
			assert.doesNotThrow(() => {
				let budgets = localStorage.readMainStorage('budgets');
				localStorage.writeMainStorage('budgets', budgets);
			}, Error);
		});
	});

	describe('#addToMainStorageArr()', function() {
		/* TODO (defined in the Storage class) */
	});

	describe('#getData()', function() {
		/* TODO */
	});

	describe('#storeData()', function() {
		/* TODO */
	});

	describe('#replaceData()', function() {
		/* TODO */
	});

	describe('#deleteData()', function() {
		/* TODO */
	});

	describe('#readJsonFile()', function() {
		/* TODO */
	});

	describe('#getJsonFiles()', function() {
		/* TODO */
	});

	describe('#getCurrentFilename()', function() {
		/* TODO */
	});

	describe('#getDataPath()', function() {
		/* TODO */
	});

	describe('#exists()', function() {
		/* TODO */
	});

	describe('#removeStats()', function() {
		/* TODO */
	});

	describe('#removeFile()', function() {
		/* TODO */
	});
});