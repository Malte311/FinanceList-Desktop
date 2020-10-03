const assert = require('assert');
const JsonStorage = require(__dirname + '/../../app/scripts/storage/jsonStorage.js');

const {appendFileSync, existsSync, mkdirSync, rmdirSync, unlinkSync} = require('fs');

describe('JsonStorage', function() {
	let jsonStorage = new JsonStorage();
	let path;

	before(function() {
		path = jsonStorage.readPreference('path');

		jsonStorage.storePreference('path', '/tmp/financelist');
		
		if (!existsSync('/tmp/financelist/')) {
			mkdirSync('/tmp/financelist/');
		}
	});

	after(function() {
		jsonStorage.storePreference('path', path);

		if (existsSync('/tmp/financelist/mainstorage.json')) {
			unlinkSync('/tmp/financelist/mainstorage.json');
		}
		
		if (existsSync('/tmp/financelist/')) {
			rmdirSync('/tmp/financelist/', {recursive: true});
		}
	});

	describe('#readPreference()', function() {
		it('should be overriden and therefore not throw an error', function() {
			assert.doesNotThrow(() => { jsonStorage.readPreference('language'); }, Error);
		});

		it('should return the correct value', function() {
			assert.strictEqual(jsonStorage.readPreference('chartType'), 'pie');
			assert.strictEqual(jsonStorage.readPreference('currency'), 'euro');
			assert.strictEqual(jsonStorage.readPreference('language'), 'en');
			assert.strictEqual(jsonStorage.readPreference('user'), null);
		});
	});

	describe('#storePreference()', function() {
		it('should be overriden and therefore not throw an error', function() {
			assert.doesNotThrow(() => {
				let lang = jsonStorage.readPreference('language');
				jsonStorage.storePreference('language', lang); // Keep the current language.
			}, Error);
		});

		it('should store the correct value', function() {
			jsonStorage.storePreference('chartType', 'bar');
			assert.strictEqual(jsonStorage.readPreference('chartType'), 'bar');
			jsonStorage.storePreference('chartType', 'pie');

			jsonStorage.storePreference('language', 'de');
			assert.strictEqual(jsonStorage.readPreference('language'), 'de');
			jsonStorage.storePreference('language', 'en');
		});
	});

	describe('#readMainStorage()', function() {
		it('should be overriden and therefore not throw an error', function() {
			assert.doesNotThrow(() => { jsonStorage.readMainStorage('budgets'); }, Error);
		});

		it('should read the correct value', function() {
			assert.deepStrictEqual(jsonStorage.readMainStorage('budgets'), [['checking account', 0]]);
			assert.deepStrictEqual(jsonStorage.readMainStorage('allocation'), [['checking account', 100]]);
			assert.deepStrictEqual(jsonStorage.readMainStorage('allTimeEarnings'), [['checking account', 0]]);
			assert.deepStrictEqual(jsonStorage.readMainStorage('allTimeSpendings'), [['checking account', 0]]);
			assert.deepStrictEqual(jsonStorage.readMainStorage('recurring'), []);
		});
	});

	describe('#writeMainStorage()', function() {
		it('should be overriden and therefore not throw an error', function() {
			assert.doesNotThrow(() => {
				let budgets = jsonStorage.readMainStorage('budgets');
				jsonStorage.writeMainStorage('budgets', budgets);
			}, Error);
		});

		it('should write the correct value', function() {
			jsonStorage.writeMainStorage('budgets', [['checking account', 0], ['saving account', 0]]);
			assert.deepStrictEqual(jsonStorage.readMainStorage('budgets'), [['checking account', 0], ['saving account', 0]]);
			jsonStorage.writeMainStorage('budgets', [['checking account', 0]]); // Reset

			jsonStorage.writeMainStorage('allocation', [['checking account', 30], ['saving account', 70]]);
			assert.deepStrictEqual(jsonStorage.readMainStorage('allocation'), [['checking account', 30], ['saving account', 70]]);
			jsonStorage.writeMainStorage('allocation', [['checking account', 100]]); // Reset
		});
	});

	describe('#addToMainStorageArr()', function() {
		it('should add the correct value', function() {
			jsonStorage.addToMainStorageArr('budgets', ['saving account', 0]);
			assert.deepStrictEqual(jsonStorage.readMainStorage('budgets'), [['checking account', 0], ['saving account', 0]]);
			jsonStorage.writeMainStorage('budgets', [['checking account', 0]]); // Reset

			jsonStorage.addToMainStorageArr('allTimeEarnings', ['saving account', 10]);
			assert.deepStrictEqual(jsonStorage.readMainStorage('allTimeEarnings'), [['checking account', 0], ['saving account', 10]]);
			jsonStorage.writeMainStorage('allTimeEarnings', [['checking account', 0]]); // Reset
		});
	});

	describe('#readJsonFile()', function() {
		it('should return the content of the file', function() {
			appendFileSync('/tmp/financelist/testread.json', JSON.stringify([
				['abc', 100],
				['def', 200]
			]), {encoding: 'utf-8'});
			
			assert.deepStrictEqual(jsonStorage.readJsonFile('/tmp/financelist/testread.json'), [
				['abc', 100],
				['def', 200]
			]);

			unlinkSync('/tmp/financelist/testread.json');
		});
	});

	describe('#getJsonFiles()', function() {
		it('should return only data files in a directory', function() {
			assert.deepStrictEqual(jsonStorage.getJsonFiles('tmp/financelist'), []);
		});

		it('should sort files by their name (which is a date)', function() {
			appendFileSync('/tmp/financelist/01.2000.json', JSON.stringify([]), {encoding: 'utf-8'});
			appendFileSync('/tmp/financelist/05.1998.json', JSON.stringify([]), {encoding: 'utf-8'});
			appendFileSync('/tmp/financelist/02.2002.json', JSON.stringify([]), {encoding: 'utf-8'});

			assert.deepStrictEqual(jsonStorage.getJsonFiles('tmp/financelist'), ['05.1998.json', '01.2000.json', '02.2002.json']);

			unlinkSync('/tmp/financelist/01.2000.json');
			unlinkSync('/tmp/financelist/05.1998.json');
			unlinkSync('/tmp/financelist/02.2002.json');
		});
	});

	describe('#getCurrentFilename()', function() {
		it('should return the correct file name for today', function() {
			let today = new Date();
			let year = today.getFullYear();
			let month = (today.getMonth() + 1).toString().padStart(2, '0'); // Zero indexed.
			
			let fNameToday = `${month}.${year}.json`;
			assert.strictEqual(jsonStorage.getCurrentFilename(), fNameToday);
		});
	});

	describe('#getDataPath()', function() {
		it('should return the correct path', function() {
			let {sep} = require('path');
			assert.strictEqual(jsonStorage.getDataPath(), jsonStorage.readPreference('path') + sep);
		});
	});

	describe('#exists()', function() {
		it('should recognize an existing path', function() {
			assert.strictEqual(jsonStorage.exists('/tmp'), true);
			assert.strictEqual(jsonStorage.exists('/tmp/financelist'), true);
		});

		it('should recognize a missing path', function() {
			assert.strictEqual(jsonStorage.exists('/tmp/financelist/blabla'), false);
			assert.strictEqual(jsonStorage.exists('/tmp/financelist/abc'), false);
		});
	});

	describe('#getData()', function() {
		it('should return the filtered data from a file', function() {
			let testArr = [{
				"date": 1598995600,
				"name": "eBay Sale",
				"amount": 21.1,
				"budget": "checking account, saving account",
				"type": "earning",
				"category": "Sales"
			}, {
				"date": 1598997600,
				"name": "Bus ticket",
				"amount": 2.5,
				"budget": "checking account",
				"type": "spending",
				"category": "Tickets"
			}];
			
			appendFileSync('/tmp/financelist/09.2020.json', JSON.stringify(testArr), {encoding: 'utf-8'});

			assert.deepStrictEqual(jsonStorage.getData('09.2020.json', {
				connector: 'or',
				params: [['type', 'earning'], ['type', 'spending']]
			}), testArr);

			assert.deepStrictEqual(jsonStorage.getData('09.2020.json', {
				connector: 'and',
				params: [['type', 'earning'], ['type', 'spending']]
			}), []);

			assert.deepStrictEqual(jsonStorage.getData('09.2020.json', {
				connector: 'and',
				params: [['type', 'earning']]
			}), [{
				"date": 1598995600,
				"name": "eBay Sale",
				"amount": 21.1,
				"budget": "checking account, saving account",
				"type": "earning",
				"category": "Sales"
			}]);

			unlinkSync('/tmp/financelist/09.2020.json');
		});
	});

	describe('#storeData()', function() {
		it('should store the correct data in the correct file', function() {
			let testObj = {
				"date": 1598997600, // 09.2020
				"name": "Bus ticket",
				"amount": 2.5,
				"budget": "checking account",
				"type": "spending",
				"category": "Tickets"
			};

			jsonStorage.storeData(testObj);

			assert.deepStrictEqual(jsonStorage.getData('09.2020.json', {
				connector: 'and',
				params: [['type', 'spending']]
			}), [testObj]);

			let testObj2 = Object.assign({}, testObj);
			testObj2.date = 1598997601;
			jsonStorage.storeData(testObj2);

			assert.deepStrictEqual(jsonStorage.getData('09.2020.json', {
				connector: 'and',
				params: [['type', 'spending']]
			}), [testObj, testObj2]);

			unlinkSync('/tmp/financelist/09.2020.json');
		});
	});

	describe('#replaceData()', function() {
		it('should handle missing files', function() {
			let testObj = {
				"date": 1598997600, // 09.2020
				"name": "Bus ticket",
				"amount": 2.5,
				"budget": "checking account",
				"type": "spending",
				"category": "Tickets"
			};

			jsonStorage.replaceData('09.2020.json', testObj);

			assert.deepStrictEqual(jsonStorage.getData('09.2020.json', {
				connector: 'and',
				params: [['type', 'spending']]
			}), [testObj]);

			unlinkSync('/tmp/financelist/09.2020.json');
		});

		it('should overwrite existing files', function() {
			let testObj = {
				"date": 1598997600, // 09.2020
				"name": "Bus ticket",
				"amount": 2.5,
				"budget": "checking account",
				"type": "spending",
				"category": "Tickets"
			};

			jsonStorage.replaceData('09.2020.json', testObj);

			assert.deepStrictEqual(jsonStorage.getData('09.2020.json', {
				connector: 'and',
				params: [['type', 'spending']]
			}), [testObj]);

			let testObj2 = Object.assign({}, testObj);
			testObj2.date = 1598997601;
			jsonStorage.replaceData('09.2020.json', testObj2);

			assert.deepStrictEqual(jsonStorage.getData('09.2020.json', {
				connector: 'and',
				params: [['type', 'spending']]
			}), [testObj2]);

			unlinkSync('/tmp/financelist/09.2020.json');
		});
	});

	describe('#deleteData()', function() {
		it('should delete existing data', function() {
			let testObj = {
				"date": 1598997600, // 09.2020
				"name": "Bus ticket",
				"amount": 2.5,
				"budget": "checking account",
				"type": "spending",
				"category": "Tickets"
			};

			jsonStorage.storeData(testObj);

			assert.deepStrictEqual(jsonStorage.getData('09.2020.json', {
				connector: 'and',
				params: [['type', 'spending']]
			}), [testObj]);

			jsonStorage.deleteData('09.2020.json', 1598997600);

			assert.deepStrictEqual(jsonStorage.getData('09.2020.json', {
				connector: 'and',
				params: [['type', 'spending']]
			}), []);

			unlinkSync('/tmp/financelist/09.2020.json');
		});

		it('should do nothing for a non-existing id', function() {
			let testObj = {
				"date": 1598997600, // 09.2020
				"name": "Bus ticket",
				"amount": 2.5,
				"budget": "checking account",
				"type": "spending",
				"category": "Tickets"
			};

			jsonStorage.storeData(testObj);

			assert.deepStrictEqual(jsonStorage.getData('09.2020.json', {
				connector: 'and',
				params: [['type', 'spending']]
			}), [testObj]);

			jsonStorage.deleteData('09.2020.json', 1598997601);
			jsonStorage.deleteData('09.2020.json', 1598997699);

			assert.deepStrictEqual(jsonStorage.getData('09.2020.json', {
				connector: 'and',
				params: [['type', 'spending']]
			}), [testObj]);

			unlinkSync('/tmp/financelist/09.2020.json');
		});

		it('should do nothing for a non-existing file', function() {
			assert.strictEqual(existsSync('/tmp/financelist/09.1999.json'), false);
			jsonStorage.deleteData('09.1999.json', 1598997600);
			assert.strictEqual(existsSync('/tmp/financelist/09.1999.json'), false);
		});
	});

	describe('#removeStats()', function() {
		it('should work for spendings and earnings correctly', function() {
			let testArr = [{
				"date": 1598995600,
				"name": "eBay Sale",
				"amount": 21.1,
				"budget": "checking account",
				"type": "earning",
				"category": "Sales"
			}, {
				"date": 1598997600,
				"name": "Bus ticket",
				"amount": 2.5,
				"budget": "checking account",
				"type": "spending",
				"category": "Tickets"
			}];

			jsonStorage.writeMainStorage('budgets', [['checking account', 100], ['saving account', 0]]);
			jsonStorage.writeMainStorage('allTimeEarnings', [['checking account', 250], ['saving account', 0]]);
			jsonStorage.writeMainStorage('allTimeSpendings', [['checking account', 150], ['saving account', 0]]);

			jsonStorage.removeStats(testArr[0]);

			assert.strictEqual(jsonStorage.readMainStorage('budgets')[0][1], Math.round((100 - 21.1) * 100) / 100);
			assert.strictEqual(jsonStorage.readMainStorage('allTimeEarnings')[0][1], Math.round((250 - 21.1) * 100) / 100);
			assert.strictEqual(jsonStorage.readMainStorage('allTimeSpendings')[0][1], 150);

			jsonStorage.removeStats(testArr[1]);

			assert.strictEqual(jsonStorage.readMainStorage('budgets')[0][1], Math.round((100 - 21.1 + 2.5) * 100) / 100);
			assert.strictEqual(jsonStorage.readMainStorage('allTimeEarnings')[0][1], Math.round((250 - 21.1) * 100) / 100);
			assert.strictEqual(jsonStorage.readMainStorage('allTimeSpendings')[0][1], Math.round((150 - 2.5) * 100) / 100);

			assert.strictEqual(jsonStorage.readMainStorage('budgets')[1][1], 0);
			assert.strictEqual(jsonStorage.readMainStorage('allTimeEarnings')[1][1], 0);
			assert.strictEqual(jsonStorage.readMainStorage('allTimeSpendings')[1][1], 0);
		});

		it('should handle negative values correctly', function() {
			let testObj = {
				"date": 1598995600,
				"name": "eBay Sale",
				"amount": 21.1,
				"budget": "checking account",
				"type": "earning",
				"category": "Sales"
			};

			jsonStorage.writeMainStorage('budgets', [['checking account', 10]]);
			jsonStorage.writeMainStorage('allTimeEarnings', [['checking account', 41.1]]);
			jsonStorage.writeMainStorage('allTimeSpendings', [['checking account', 31.1]]);

			jsonStorage.removeStats(testObj);

			assert.strictEqual(jsonStorage.readMainStorage('budgets')[0][1], Math.round((10 - 21.1) * 100) / 100);
			assert.strictEqual(jsonStorage.readMainStorage('allTimeEarnings')[0][1], Math.round((41.1 - 21.1) * 100) / 100);
			assert.strictEqual(jsonStorage.readMainStorage('allTimeSpendings')[0][1], 31.1);
		});
	});
});