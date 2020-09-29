const assert = require('assert');
const JsonStorage = require(__dirname + '/../../app/scripts/storage/jsonStorage.js');
const RecurrTrans = require(__dirname + '/../../app/scripts/updates/recurrTrans.js');

const {existsSync, unlinkSync} = require('fs');

describe('RecurrTrans', function() {
	let jsonStorage = new JsonStorage();
	let recurrTrans = new RecurrTrans(jsonStorage);

	let path;

	before(function() {
		path = jsonStorage.readPreference('path');

		jsonStorage.storePreference('path', __dirname);
	});

	beforeEach(function() {
		jsonStorage.writeMainStorage('recurring', []);
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

	describe('#execRecurrTransact()', function() {
		it('should execute a transaction multiple times correctly', function() {
			let testObj = {
				startDate: Math.round(Date.now() / 1000) - (13 * 24 * 60 * 60), // 13 days in seconds
				nextDate: Math.round(Date.now() / 1000) - (13 * 24 * 60 * 60),
				endDate: Math.round(Date.now() / 1000),
				name: 'Salary',
				amount: 1500,
				budget: 'checking account',
				type: 'earning',
				category: 'Income',
				interval: 0, // every 7 days
				allocationOn: true
			};

			jsonStorage.writeMainStorage('recurring', [testObj]);

			recurrTrans.execRecurrTransact();

			assert.deepStrictEqual(jsonStorage.readMainStorage('recurring'), []);

			assert.deepStrictEqual(jsonStorage.readJsonFile(__dirname + '/09.2020.json').map(obj => {
				delete obj.date;
				return obj;
			}), [{
				name: 'Salary',
				amount: 1500,
				budget: 'checking account',
				type: 'earning',
				category: 'Income'
			}, {
				name: 'Salary',
				amount: 1500,
				budget: 'checking account',
				type: 'earning',
				category: 'Income'
			}]);

			assert.strictEqual(jsonStorage.readMainStorage('budgets')[0][1], 3000);
			assert.strictEqual(jsonStorage.readMainStorage('allTimeEarnings')[0][1], 3000);
			assert.strictEqual(jsonStorage.readMainStorage('allTimeSpendings')[0][1], 0);
		});

		it('should execute a transaction with allocation enabled correctly', function() {
			jsonStorage.writeMainStorage('budgets', [['checking account', 0], ['saving account', 0]]);
			jsonStorage.writeMainStorage('allTimeEarnings', [['checking account', 0], ['saving account', 0]]);
			jsonStorage.writeMainStorage('allTimeSpendings', [['checking account', 0], ['saving account', 0]]);
			jsonStorage.writeMainStorage('allocation', [['checking account', 30], ['saving account', 70]]);
			jsonStorage.writeMainStorage('recurring', [{
				startDate: Math.round(Date.now() / 1000) - (5 * 24 * 60 * 60), // 5 days in seconds
				nextDate: Math.round(Date.now() / 1000) - (5 * 24 * 60 * 60),
				endDate: Math.round(Date.now() / 1000),
				name: 'Salary',
				amount: 1500,
				budget: 'checking account',
				type: 'earning',
				category: 'Income',
				interval: 0, // every 7 days
				allocationOn: true
			}]);

			recurrTrans.execRecurrTransact();

			assert.deepStrictEqual(jsonStorage.readMainStorage('recurring'), []);

			assert.deepStrictEqual(jsonStorage.readJsonFile(__dirname + '/09.2020.json').map(obj => {
				delete obj.date;
				return obj;
			}), [{
				name: 'Salary',
				amount: 450,
				budget: 'checking account',
				type: 'earning',
				category: 'Income'
			}, {
				name: 'Salary',
				amount: 1050,
				budget: 'saving account',
				type: 'earning',
				category: 'Income'
			}]);

			assert.strictEqual(jsonStorage.readMainStorage('budgets')[0][1], 450);
			assert.strictEqual(jsonStorage.readMainStorage('budgets')[1][1], 1050);
			assert.strictEqual(jsonStorage.readMainStorage('allTimeEarnings')[0][1], 450);
			assert.strictEqual(jsonStorage.readMainStorage('allTimeEarnings')[1][1], 1050);
			assert.strictEqual(jsonStorage.readMainStorage('allTimeSpendings')[0][1], 0);
			assert.strictEqual(jsonStorage.readMainStorage('allTimeSpendings')[1][1], 0);
		});
	});

	describe('#addRecurringTransaction()', function() {
		it('should not execute a transaction in the future', function() {
			let testObj = {
				name: 'Apple Music',
				amount: 100,
				budget: 'checking account',
				category: 'Subscriptions',
				type: 'spending',
				interval: 2, // monthly
				startDate: (Date.now() / 1000) + 600, // 10 min in the future
				endDate: -1,
				allocationOn: false
			};

			recurrTrans.addRecurringTransaction(testObj);

			let recurring = jsonStorage.readMainStorage('recurring');

			assert.strictEqual(recurring.length, 1);
			assert.strictEqual(jsonStorage.readMainStorage('budgets')[0][1], 0);
			assert.strictEqual(jsonStorage.readMainStorage('allTimeEarnings')[0][1], 0);
			assert.strictEqual(jsonStorage.readMainStorage('allTimeSpendings')[0][1], 0);
			assert.deepStrictEqual(recurring[0], testObj);
		});

		it('should execute a transaction in the past', function() {
			let startDate = Math.floor((Date.now() / 1000) - 600); // 10 min in the past
			let testObj = {
				name: 'Apple Music',
				amount: 100,
				budget: 'checking account',
				category: 'Subscriptions',
				type: 'spending',
				interval: 2, // monthly
				startDate: startDate,
				endDate: -1,
				allocationOn: false
			};

			recurrTrans.addRecurringTransaction(testObj);

			let recurring = jsonStorage.readMainStorage('recurring');

			assert.strictEqual(recurring.length, 1);
			assert.strictEqual(jsonStorage.readMainStorage('budgets')[0][1], -100);
			assert.strictEqual(jsonStorage.readMainStorage('allTimeEarnings')[0][1], 0);
			assert.strictEqual(jsonStorage.readMainStorage('allTimeSpendings')[0][1], 100);
			assert.strictEqual((new Date(recurring[0].nextDate * 1000)).getMonth(), new Date(startDate * 1000).getMonth() + 1);
		});
	});

	describe('#editRecurringTransaction()', function() {
		it('should edit the correct property and set it to the correct value', function() {
			let startDate = Math.round((Date.now() / 1000) + 600); // 10 min from now
			let testArr = require(__dirname + '/recurrTransTestHelper.js').map((trans, index) => {
				trans.startDate = startDate + index;
				return trans;
			});

			testArr.forEach((trans, index) => {
				trans.startDate = startDate + index;
				recurrTrans.addRecurringTransaction(trans);
			});

			assert.strictEqual(jsonStorage.readMainStorage('recurring').length, 3);
			assert.deepStrictEqual(jsonStorage.readMainStorage('recurring'), testArr);

			recurrTrans.editRecurringTransaction(startDate + 2, {
				name: 'New name',
				category: 'New category'
			});

			testArr[2] = Object.assign(testArr[2], {name: 'New name', category: 'New category'});
			assert.deepStrictEqual(jsonStorage.readMainStorage('recurring'), testArr);

			recurrTrans.editRecurringTransaction(startDate + 1, {
				budget: 'new budget',
				amount: 300.33
			});

			testArr[1] = Object.assign(testArr[1], {budget: 'new budget', amount: 300.33});
			assert.deepStrictEqual(jsonStorage.readMainStorage('recurring'), testArr);
		});
	});

	describe('#deleteRecurringTransaction()', function() {
		it('should delete the correct transaction', function() {
			let startDate = Math.round((Date.now() / 1000) + 600); // 10 min from now
			let testArr = require(__dirname + '/recurrTransTestHelper.js');

			testArr.forEach((trans, index) => {
				trans.startDate = startDate + index;
				recurrTrans.addRecurringTransaction(trans);
			});

			assert.strictEqual(jsonStorage.readMainStorage('recurring').length, 3);
			assert.deepStrictEqual(jsonStorage.readMainStorage('recurring'), testArr.map((trans, index) => {
				trans.startDate = startDate + index;
				return trans;
			}));

			recurrTrans.deleteRecurringTransaction(startDate + 2);
			assert.strictEqual(jsonStorage.readMainStorage('recurring').length, 2);
			assert.deepStrictEqual(jsonStorage.readMainStorage('recurring'), testArr.map((trans, index) => {
				trans.startDate = startDate + index;
				return trans;
			}).filter(trans => trans.startDate !== startDate + 2));


			recurrTrans.deleteRecurringTransaction(startDate + 1);
			assert.strictEqual(jsonStorage.readMainStorage('recurring').length, 1);
			assert.deepStrictEqual(jsonStorage.readMainStorage('recurring'), testArr.map((trans, index) => {
				trans.startDate = startDate + index;
				return trans;
			}).filter(trans => trans.startDate !== startDate + 2 && trans.startDate !== startDate + 1));

			recurrTrans.deleteRecurringTransaction(startDate);
			assert.strictEqual(jsonStorage.readMainStorage('recurring').length, 0);
			assert.deepStrictEqual(jsonStorage.readMainStorage('recurring'), []);

			recurrTrans.deleteRecurringTransaction(startDate); // Not existing
			assert.strictEqual(jsonStorage.readMainStorage('recurring').length, 0);
			assert.deepStrictEqual(jsonStorage.readMainStorage('recurring'), []);
		});
	});

	describe('#transToObj()', function() {
		it('should keep the correct properties', function() {
			let transObj = {
				startDate: 1599642796,
				nextDate: 1599642796,
				endDate: -1,
				name: 'Apple Music',
				amount: 9.99,
				budget: 'checking account',
				type: 'spending',
				category: 'Subscriptions',
				interval: 2, // monthly
				allocationOn: false
			};

			assert.deepStrictEqual(recurrTrans.transToObj(transObj), {
				name: 'Apple Music',
				amount: 9.99,
				budget: 'checking account',
				type: 'spending',
				category: 'Subscriptions',
				date: transObj.startDate
			});
		});
	});
});