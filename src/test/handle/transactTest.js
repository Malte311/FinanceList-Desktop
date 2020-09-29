const assert = require('assert');
const Transact = require(__dirname + '/../../app/scripts/handle/transact.js');
const JsonStorage = require(__dirname + '/../../app/scripts/storage/jsonStorage.js');

const {unlinkSync, existsSync} = require('fs');

describe('Transact', function() {
	let jsonStorage = new JsonStorage();
	let transact = new Transact(jsonStorage);

	let path;

	before(function() {
		path = jsonStorage.readPreference('path');

		jsonStorage.storePreference('path', __dirname);
	});

	beforeEach(function() {
		jsonStorage.writeMainStorage('budgets', [['checking account', 0]]);
		jsonStorage.writeMainStorage('allTimeEarnings', [['checking account', 0]]);
		jsonStorage.writeMainStorage('allTimeSpendings', [['checking account', 0]]);
		jsonStorage.writeMainStorage('allocation', [['checking account', 100]]);
	});

	after(function() {
		jsonStorage.storePreference('path', path);

		unlinkSync(__dirname + '/mainstorage.json');
	});

	afterEach(function() {
		if (existsSync(__dirname + '/09.2020.json')) {
			unlinkSync(__dirname + '/09.2020.json');
		}
	});

	describe('#addEarning()', function() {
		it('should add a single entry correctly', function() {
			let testObj = {
				date: 1599642796, // 09.09.2020
				name: 'Salary',
				amount: 500.55,
				budget: 'checking account',
				type: 'earning',
				category: 'Income'
			};

			transact.addEarning(testObj, false);

			assert.deepStrictEqual(jsonStorage.readJsonFile(__dirname + '/09.2020.json'), [testObj]);
			assert.strictEqual(jsonStorage.readMainStorage('budgets')[0][1], 500.55);
			assert.strictEqual(jsonStorage.readMainStorage('allTimeEarnings')[0][1], 500.55);
			assert.strictEqual(jsonStorage.readMainStorage('allTimeSpendings')[0][1], 0);
		});

		it('should add multiple entries correctly', function() {
			let testObj1 = {
				date: 1599642796, // 09.09.2020
				name: 'Salary',
				amount: 500.55,
				budget: 'checking account',
				type: 'earning',
				category: 'Income'
			};

			let testObj2 = {
				date: 1599642799, // 09.09.2020
				name: 'Salary',
				amount: 500.55,
				budget: 'checking account',
				type: 'earning',
				category: 'Income'
			};

			transact.addEarning(testObj1, false);

			assert.deepStrictEqual(jsonStorage.readJsonFile(__dirname + '/09.2020.json'), [testObj1]);
			assert.strictEqual(jsonStorage.readMainStorage('budgets')[0][1], 500.55);
			assert.strictEqual(jsonStorage.readMainStorage('allTimeEarnings')[0][1], 500.55);
			assert.strictEqual(jsonStorage.readMainStorage('allTimeSpendings')[0][1], 0);

			transact.addEarning(testObj2, true);

			assert.deepStrictEqual(jsonStorage.readJsonFile(__dirname + '/09.2020.json'), [testObj1, testObj2]);
			assert.strictEqual(jsonStorage.readMainStorage('budgets')[0][1], 1001.1);
			assert.strictEqual(jsonStorage.readMainStorage('allTimeEarnings')[0][1], 1001.1);
			assert.strictEqual(jsonStorage.readMainStorage('allTimeSpendings')[0][1], 0);
		});

		it('should work correctly together with addSpending()', function() {
			let testObj1 = {
				date: 1599642796, // 09.09.2020
				name: 'Salary',
				amount: 1500,
				budget: 'checking account',
				type: 'earning',
				category: 'Income'
			};

			let testObj2 = {
				date: 1599642799, // 09.09.2020
				name: 'Apple Music',
				amount: 50.5,
				budget: 'checking account',
				type: 'spending',
				category: 'Subscriptions'
			};

			transact.addEarning(testObj1, true);

			assert.deepStrictEqual(jsonStorage.readJsonFile(__dirname + '/09.2020.json'), [testObj1]);
			assert.strictEqual(jsonStorage.readMainStorage('budgets')[0][1], 1500);
			assert.strictEqual(jsonStorage.readMainStorage('allTimeEarnings')[0][1], 1500);
			assert.strictEqual(jsonStorage.readMainStorage('allTimeSpendings')[0][1], 0);

			transact.addSpending(testObj2);

			assert.deepStrictEqual(jsonStorage.readJsonFile(__dirname + '/09.2020.json'), [testObj1, testObj2]);
			assert.strictEqual(jsonStorage.readMainStorage('budgets')[0][1], 1449.5);
			assert.strictEqual(jsonStorage.readMainStorage('allTimeEarnings')[0][1], 1500);
			assert.strictEqual(jsonStorage.readMainStorage('allTimeSpendings')[0][1], 50.5);
		});
	});

	describe('#addEarningSingle()', function() {
		it('should add multiple entries correctly', function() {
			jsonStorage.writeMainStorage('budgets', [['checking account', 0], ['saving account', 0]]);
			jsonStorage.writeMainStorage('allTimeEarnings', [['checking account', 0], ['saving account', 0]]);
			jsonStorage.writeMainStorage('allTimeSpendings', [['checking account', 0], ['saving account', 0]]);

			let testObj1 = {
				date: 1599642796, // 09.09.2020
				name: 'Salary',
				amount: 999.99,
				budget: 'checking account',
				type: 'earning',
				category: 'Income'
			};

			let testObj2 = {
				date: 1599642799, // 09.09.2020
				name: 'Salary',
				amount: 999.99,
				budget: 'saving account',
				type: 'earning',
				category: 'Income'
			};

			transact.addEarningSingle(testObj1);

			assert.deepStrictEqual(jsonStorage.readJsonFile(__dirname + '/09.2020.json'), [testObj1]);
			assert.strictEqual(jsonStorage.readMainStorage('budgets')[0][1], 999.99);
			assert.strictEqual(jsonStorage.readMainStorage('budgets')[1][1], 0);
			assert.strictEqual(jsonStorage.readMainStorage('allTimeEarnings')[0][1], 999.99);
			assert.strictEqual(jsonStorage.readMainStorage('allTimeEarnings')[1][1], 0);
			assert.strictEqual(jsonStorage.readMainStorage('allTimeSpendings')[0][1], 0);
			assert.strictEqual(jsonStorage.readMainStorage('allTimeSpendings')[1][1], 0);

			transact.addEarningSingle(testObj2);

			assert.deepStrictEqual(jsonStorage.readJsonFile(__dirname + '/09.2020.json'), [testObj1, testObj2]);
			assert.strictEqual(jsonStorage.readMainStorage('budgets')[0][1], 999.99);
			assert.strictEqual(jsonStorage.readMainStorage('budgets')[1][1], 999.99);
			assert.strictEqual(jsonStorage.readMainStorage('allTimeEarnings')[0][1], 999.99);
			assert.strictEqual(jsonStorage.readMainStorage('allTimeEarnings')[1][1], 999.99);
			assert.strictEqual(jsonStorage.readMainStorage('allTimeSpendings')[0][1], 0);
			assert.strictEqual(jsonStorage.readMainStorage('allTimeSpendings')[1][1], 0);
		});
	});

	describe('#addEarningSplit()', function() {
		it('should split entries correctly', function() {
			jsonStorage.writeMainStorage('budgets', [['checking account', 0], ['saving account', 0]]);
			jsonStorage.writeMainStorage('allTimeEarnings', [['checking account', 0], ['saving account', 0]]);
			jsonStorage.writeMainStorage('allTimeSpendings', [['checking account', 0], ['saving account', 0]]);
			jsonStorage.writeMainStorage('allocation', [['checking account', 30], ['saving account', 70]]);

			let testObj1 = {
				date: 1599642796, // 09.09.2020
				name: 'Salary',
				amount: 100,
				budget: 'checking account',
				type: 'earning',
				category: 'Income'
			};

			let testObj2 = {
				date: 1599642799, // 09.09.2020
				name: 'Salary',
				amount: 50,
				budget: 'checking account',
				type: 'earning',
				category: 'Income'
			};

			transact.addEarningSplit(testObj1);

			assert.deepStrictEqual(jsonStorage.readJsonFile(__dirname + '/09.2020.json'), [{
				date: 1599642796, // 09.09.2020
				name: 'Salary',
				amount: 30,
				budget: 'checking account',
				type: 'earning',
				category: 'Income'
			}, {
				date: 1599642796, // 09.09.2020
				name: 'Salary',
				amount: 70,
				budget: 'saving account',
				type: 'earning',
				category: 'Income'
			}]);

			assert.strictEqual(jsonStorage.readMainStorage('budgets')[0][1], 30);
			assert.strictEqual(jsonStorage.readMainStorage('budgets')[1][1], 70);
			assert.strictEqual(jsonStorage.readMainStorage('allTimeEarnings')[0][1], 30);
			assert.strictEqual(jsonStorage.readMainStorage('allTimeEarnings')[1][1], 70);
			assert.strictEqual(jsonStorage.readMainStorage('allTimeSpendings')[0][1], 0);
			assert.strictEqual(jsonStorage.readMainStorage('allTimeSpendings')[1][1], 0);

			transact.addEarningSplit(testObj2);

			assert.deepStrictEqual(jsonStorage.readJsonFile(__dirname + '/09.2020.json'), [{
				date: 1599642796, // 09.09.2020
				name: 'Salary',
				amount: 30,
				budget: 'checking account',
				type: 'earning',
				category: 'Income'
			}, {
				date: 1599642796, // 09.09.2020
				name: 'Salary',
				amount: 70,
				budget: 'saving account',
				type: 'earning',
				category: 'Income'
			}, {
				date: 1599642799, // 09.09.2020
				name: 'Salary',
				amount: 15,
				budget: 'checking account',
				type: 'earning',
				category: 'Income'
			}, {
				date: 1599642799, // 09.09.2020
				name: 'Salary',
				amount: 35,
				budget: 'saving account',
				type: 'earning',
				category: 'Income'
			}]);
			assert.strictEqual(jsonStorage.readMainStorage('budgets')[0][1], 45);
			assert.strictEqual(jsonStorage.readMainStorage('budgets')[1][1], 105);
			assert.strictEqual(jsonStorage.readMainStorage('allTimeEarnings')[0][1], 45);
			assert.strictEqual(jsonStorage.readMainStorage('allTimeEarnings')[1][1], 105);
			assert.strictEqual(jsonStorage.readMainStorage('allTimeSpendings')[0][1], 0);
			assert.strictEqual(jsonStorage.readMainStorage('allTimeSpendings')[1][1], 0);
		});

		it('should split uneven amounts correctly', function() {
			jsonStorage.writeMainStorage('budgets', [['checking account', 0], ['saving account', 0]]);
			jsonStorage.writeMainStorage('allTimeEarnings', [['checking account', 0], ['saving account', 0]]);
			jsonStorage.writeMainStorage('allTimeSpendings', [['checking account', 0], ['saving account', 0]]);
			jsonStorage.writeMainStorage('allocation', [['checking account', 30], ['saving account', 70]]);

			let testObj = {
				date: 1599642796, // 09.09.2020
				name: 'Refund',
				amount: 9.99,
				budget: 'checking account',
				type: 'earning',
				category: 'Refunds'
			};

			transact.addEarningSplit(testObj);

			assert.deepStrictEqual(jsonStorage.readJsonFile(__dirname + '/09.2020.json'), [{
				date: 1599642796, // 09.09.2020
				name: 'Refund',
				amount: 3,
				budget: 'checking account',
				type: 'earning',
				category: 'Refunds'
			}, {
				date: 1599642796, // 09.09.2020
				name: 'Refund',
				amount: 6.99,
				budget: 'saving account',
				type: 'earning',
				category: 'Refunds'
			}]);
			assert.strictEqual(jsonStorage.readMainStorage('budgets')[0][1], 3);
			assert.strictEqual(jsonStorage.readMainStorage('budgets')[1][1], 6.99);
			assert.strictEqual(jsonStorage.readMainStorage('allTimeEarnings')[0][1], 3);
			assert.strictEqual(jsonStorage.readMainStorage('allTimeEarnings')[1][1], 6.99);
			assert.strictEqual(jsonStorage.readMainStorage('allTimeSpendings')[0][1], 0);
			assert.strictEqual(jsonStorage.readMainStorage('allTimeSpendings')[1][1], 0);
		});
	});

	describe('#addSpending()', function() {
		it('should add a single entry correctly', function() {
			let testObj = {
				date: 1599642796, // 09.09.2020
				name: 'Apple Music',
				amount: 50,
				budget: 'checking account',
				type: 'spending',
				category: 'Subscriptions'
			};

			transact.addSpending(testObj);

			let fileContents = jsonStorage.readJsonFile(__dirname + '/09.2020.json');

			assert.deepStrictEqual(fileContents, [testObj]);
			assert.strictEqual(jsonStorage.readMainStorage('budgets')[0][1], -50);
			assert.strictEqual(jsonStorage.readMainStorage('allTimeEarnings')[0][1], 0);
			assert.strictEqual(jsonStorage.readMainStorage('allTimeSpendings')[0][1], 50);
		});

		it('should add multiple entries correctly', function() {
			let testObj1 = {
				date: 1599642796, // 09.09.2020
				name: 'Apple Music',
				amount: 50,
				budget: 'checking account',
				type: 'spending',
				category: 'Subscriptions'
			};

			let testObj2 = {
				date: 1599642799, // 09.09.2020
				name: 'Hair salon',
				amount: 18,
				budget: 'checking account',
				type: 'spending',
				category: 'Personal care'
			};

			transact.addSpending(testObj1);

			assert.deepStrictEqual(jsonStorage.readJsonFile(__dirname + '/09.2020.json'), [testObj1]);
			assert.strictEqual(jsonStorage.readMainStorage('budgets')[0][1], -50);
			assert.strictEqual(jsonStorage.readMainStorage('allTimeEarnings')[0][1], 0);
			assert.strictEqual(jsonStorage.readMainStorage('allTimeSpendings')[0][1], 50);

			transact.addSpending(testObj2);

			assert.deepStrictEqual(jsonStorage.readJsonFile(__dirname + '/09.2020.json'), [testObj1, testObj2]);
			assert.strictEqual(jsonStorage.readMainStorage('budgets')[0][1], -68);
			assert.strictEqual(jsonStorage.readMainStorage('allTimeEarnings')[0][1], 0);
			assert.strictEqual(jsonStorage.readMainStorage('allTimeSpendings')[0][1], 68);
		});

		it('should work correctly together with addEarning()', function() {
			let testObj1 = {
				date: 1599642796, // 09.09.2020
				name: 'Apple Music',
				amount: 50.5,
				budget: 'checking account',
				type: 'spending',
				category: 'Subscriptions'
			};

			let testObj2 = {
				date: 1599642799, // 09.09.2020
				name: 'Salary',
				amount: 1500,
				budget: 'checking account',
				type: 'earning',
				category: 'Income'
			};

			transact.addSpending(testObj1);

			assert.deepStrictEqual(jsonStorage.readJsonFile(__dirname + '/09.2020.json'), [testObj1]);
			assert.strictEqual(jsonStorage.readMainStorage('budgets')[0][1], -50.5);
			assert.strictEqual(jsonStorage.readMainStorage('allTimeEarnings')[0][1], 0);
			assert.strictEqual(jsonStorage.readMainStorage('allTimeSpendings')[0][1], 50.5);

			transact.addEarning(testObj2, false);

			assert.deepStrictEqual(jsonStorage.readJsonFile(__dirname + '/09.2020.json'), [testObj1, testObj2]);
			assert.strictEqual(jsonStorage.readMainStorage('budgets')[0][1], 1449.5);
			assert.strictEqual(jsonStorage.readMainStorage('allTimeEarnings')[0][1], 1500);
			assert.strictEqual(jsonStorage.readMainStorage('allTimeSpendings')[0][1], 50.5);
		});

		it('should handle multiple budgets correctly', function() {
			jsonStorage.writeMainStorage('budgets', [['checking account', 0], ['saving account', 0]]);
			jsonStorage.writeMainStorage('allTimeEarnings', [['checking account', 0], ['saving account', 0]]);
			jsonStorage.writeMainStorage('allTimeSpendings', [['checking account', 0], ['saving account', 0]]);

			let testObj1 = {
				date: 1599642796, // 09.09.2020
				name: 'Apple Music',
				amount: 50,
				budget: 'checking account',
				type: 'spending',
				category: 'Subscriptions'
			};

			let testObj2 = {
				date: 1599642799, // 09.09.2020
				name: 'Hair salon',
				amount: 18,
				budget: 'saving account',
				type: 'spending',
				category: 'Personal care'
			};

			transact.addSpending(testObj1);

			assert.deepStrictEqual(jsonStorage.readJsonFile(__dirname + '/09.2020.json'), [testObj1]);
			assert.strictEqual(jsonStorage.readMainStorage('budgets')[0][1], -50);
			assert.strictEqual(jsonStorage.readMainStorage('budgets')[1][1], 0);
			assert.strictEqual(jsonStorage.readMainStorage('allTimeEarnings')[0][1], 0);
			assert.strictEqual(jsonStorage.readMainStorage('allTimeEarnings')[1][1], 0);
			assert.strictEqual(jsonStorage.readMainStorage('allTimeSpendings')[0][1], 50);
			assert.strictEqual(jsonStorage.readMainStorage('allTimeSpendings')[1][1], 0);

			transact.addSpending(testObj2);

			assert.deepStrictEqual(jsonStorage.readJsonFile(__dirname + '/09.2020.json'), [testObj1, testObj2]);
			assert.strictEqual(jsonStorage.readMainStorage('budgets')[0][1], -50);
			assert.strictEqual(jsonStorage.readMainStorage('budgets')[1][1], -18);
			assert.strictEqual(jsonStorage.readMainStorage('allTimeEarnings')[0][1], 0);
			assert.strictEqual(jsonStorage.readMainStorage('allTimeEarnings')[1][1], 0);
			assert.strictEqual(jsonStorage.readMainStorage('allTimeSpendings')[0][1], 50);
			assert.strictEqual(jsonStorage.readMainStorage('allTimeSpendings')[1][1], 18);
		});
	});

	describe('#updateMainStorageArr()', function() {
		it('should update the budgets array correctly', function() {
			transact.updateMainStorageArr('budgets', 'checking account', 50);
			assert.strictEqual(jsonStorage.readMainStorage('budgets')[0][1], 50);

			transact.updateMainStorageArr('budgets', 'checking account', -150);
			assert.strictEqual(jsonStorage.readMainStorage('budgets')[0][1], -100);

			transact.updateMainStorageArr('budgets', 'checking account', 50.5);
			assert.strictEqual(jsonStorage.readMainStorage('budgets')[0][1], -49.5);

			transact.updateMainStorageArr('budgets', 'checking account', 50.5);
			assert.strictEqual(jsonStorage.readMainStorage('budgets')[0][1], 1);
		});

		it('should update the allTimeEarnings array correctly', function() {
			transact.updateMainStorageArr('allTimeEarnings', 'checking account', 50);
			assert.strictEqual(jsonStorage.readMainStorage('allTimeEarnings')[0][1], 50);

			transact.updateMainStorageArr('allTimeEarnings', 'checking account', -150);
			assert.strictEqual(jsonStorage.readMainStorage('allTimeEarnings')[0][1], -100);

			transact.updateMainStorageArr('allTimeEarnings', 'checking account', 50.5);
			assert.strictEqual(jsonStorage.readMainStorage('allTimeEarnings')[0][1], -49.5);

			transact.updateMainStorageArr('allTimeEarnings', 'checking account', 50.5);
			assert.strictEqual(jsonStorage.readMainStorage('allTimeEarnings')[0][1], 1);
		});

		it('should update the allTimeSpendings array correctly', function() {
			transact.updateMainStorageArr('allTimeSpendings', 'checking account', 50);
			assert.strictEqual(jsonStorage.readMainStorage('allTimeSpendings')[0][1], 50);

			transact.updateMainStorageArr('allTimeSpendings', 'checking account', -150);
			assert.strictEqual(jsonStorage.readMainStorage('allTimeSpendings')[0][1], -100);

			transact.updateMainStorageArr('allTimeSpendings', 'checking account', 50.5);
			assert.strictEqual(jsonStorage.readMainStorage('allTimeSpendings')[0][1], -49.5);

			transact.updateMainStorageArr('allTimeSpendings', 'checking account', 50.5);
			assert.strictEqual(jsonStorage.readMainStorage('allTimeSpendings')[0][1], 1);
		});

		it('should handle multiple budgets correctly', function() {
			jsonStorage.writeMainStorage('budgets', [['checking account', 0], ['saving account', 0]]);

			transact.updateMainStorageArr('budgets', 'saving account', 50);
			assert.strictEqual(jsonStorage.readMainStorage('budgets')[0][1], 0);
			assert.strictEqual(jsonStorage.readMainStorage('budgets')[1][1], 50);

			transact.updateMainStorageArr('budgets', 'checking account', -150.5);
			assert.strictEqual(jsonStorage.readMainStorage('budgets')[0][1], -150.5);
			assert.strictEqual(jsonStorage.readMainStorage('budgets')[1][1], 50);

			transact.updateMainStorageArr('budgets', 'saving account', 150.5);
			assert.strictEqual(jsonStorage.readMainStorage('budgets')[0][1], -150.5);
			assert.strictEqual(jsonStorage.readMainStorage('budgets')[1][1], 200.5);
		});
	});
});