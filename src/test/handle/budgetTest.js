const assert = require('assert');
const Budget = require(__dirname + '/../../app/scripts/handle/budget.js');
const Transact = require(__dirname + '/../../app/scripts/handle/transact.js');
const JsonStorage = require(__dirname + '/../../app/scripts/storage/jsonStorage.js');

const {existsSync, mkdirSync, rmdirSync, unlinkSync} = require('fs');

describe('Budget', function() {
	let jsonStorage = new JsonStorage();
	let budget = new Budget(jsonStorage);
	let activeUser, path;

	before(function() {
		activeUser = jsonStorage.readPreference('activeUser');
		path = jsonStorage.readPreference('path');

		jsonStorage.storePreference('activeUser', undefined);
		jsonStorage.storePreference('path', '/tmp/financelist');

		if (!existsSync('/tmp/financelist/')) {
			mkdirSync('/tmp/financelist/');
		}
	});

	beforeEach(function() {
		jsonStorage.writeMainStorage('budgets', [['checking account', 0]]);
		jsonStorage.writeMainStorage('allTimeEarnings', [['checking account', 0]]);
		jsonStorage.writeMainStorage('allTimeSpendings', [['checking account', 0]]);
		jsonStorage.writeMainStorage('allocation', [['checking account', 100]]);
	});

	after(function() {
		jsonStorage.storePreference('activeUser', activeUser);
		jsonStorage.storePreference('path', path);

		if (existsSync('/tmp/financelist/mainstorage.json')) {
			unlinkSync('/tmp/financelist/mainstorage.json');
		}

		if (existsSync('/tmp/financelist/')) {
			rmdirSync('/tmp/financelist/', {recursive: true});
		}
	});

	describe('#addBudget()', function() {
		it('should add a new budget to the mainstorage', function() {
			budget.addBudget('test account');

			assert.deepStrictEqual(jsonStorage.readMainStorage('budgets'), [['checking account', 0], ['test account', 0]]);
			assert.deepStrictEqual(jsonStorage.readMainStorage('allTimeEarnings'), [['checking account', 0], ['test account', 0]]);
			assert.deepStrictEqual(jsonStorage.readMainStorage('allTimeSpendings'), [['checking account', 0], ['test account', 0]]);
			assert.deepStrictEqual(jsonStorage.readMainStorage('allocation'), [['checking account', 100], ['test account', 0]]);
		});
	});

	describe('#renameBudget()', function() {
		it('should rename the budget name correctly', function() {
			budget.renameBudget('checking account', 'saving account');

			assert.deepStrictEqual(jsonStorage.readMainStorage('budgets'), [['saving account', 0]]);
			assert.deepStrictEqual(jsonStorage.readMainStorage('allTimeEarnings'), [['saving account', 0]]);
			assert.deepStrictEqual(jsonStorage.readMainStorage('allTimeSpendings'), [['saving account', 0]]);
			assert.deepStrictEqual(jsonStorage.readMainStorage('allocation'), [['saving account', 100]]);

			budget.addBudget('checking account');

			assert.deepStrictEqual(jsonStorage.readMainStorage('budgets'), [['saving account', 0], ['checking account', 0]]);
			assert.deepStrictEqual(jsonStorage.readMainStorage('allTimeEarnings'), [['saving account', 0], ['checking account', 0]]);
			assert.deepStrictEqual(jsonStorage.readMainStorage('allTimeSpendings'), [['saving account', 0], ['checking account', 0]]);
			assert.deepStrictEqual(jsonStorage.readMainStorage('allocation'), [['saving account', 100], ['checking account', 0]]);
		});

		it('should rename the data entries correctly', function() {
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
				budget: 'saving account',
				type: 'earning',
				category: 'Income'
			};

			let transact = new Transact(jsonStorage);

			budget.addBudget('saving account');
			transact.addEarningSingle(testObj1);
			transact.addEarningSingle(testObj2);
			
			assert.deepStrictEqual(jsonStorage.readJsonFile('/tmp/financelist/09.2020.json'), [testObj1, testObj2]);
			assert.deepStrictEqual(jsonStorage.readMainStorage('budgets'), [['checking account', 500.55], ['saving account', 500.55]]);
			assert.deepStrictEqual(jsonStorage.readMainStorage('allTimeEarnings'), [['checking account', 500.55], ['saving account', 500.55]]);
			assert.deepStrictEqual(jsonStorage.readMainStorage('allTimeSpendings'), [['checking account', 0], ['saving account', 0]]);
			assert.deepStrictEqual(jsonStorage.readMainStorage('allocation'), [['checking account', 100], ['saving account', 0]]);

			budget.renameBudget('checking account', 'new account');

			testObj1.budget = 'new account';

			assert.deepStrictEqual(jsonStorage.readJsonFile('/tmp/financelist/09.2020.json'), [testObj1, testObj2]);
			assert.deepStrictEqual(jsonStorage.readMainStorage('budgets'), [['new account', 500.55], ['saving account', 500.55]]);
			assert.deepStrictEqual(jsonStorage.readMainStorage('allTimeEarnings'), [['new account', 500.55], ['saving account', 500.55]]);
			assert.deepStrictEqual(jsonStorage.readMainStorage('allTimeSpendings'), [['new account', 0], ['saving account', 0]]);
			assert.deepStrictEqual(jsonStorage.readMainStorage('allocation'), [['new account', 100], ['saving account', 0]]);
		});

		it('should rename recurring entries correctly', function() {
			budget.addBudget('saving account');
			
			assert.deepStrictEqual(jsonStorage.readMainStorage('budgets'), [['checking account', 0], ['saving account', 0]]);
			assert.deepStrictEqual(jsonStorage.readMainStorage('allTimeEarnings'), [['checking account', 0], ['saving account', 0]]);
			assert.deepStrictEqual(jsonStorage.readMainStorage('allTimeSpendings'), [['checking account', 0], ['saving account', 0]]);
			assert.deepStrictEqual(jsonStorage.readMainStorage('allocation'), [['checking account', 100], ['saving account', 0]]);

			let testArr = [{
				startDate: 1599642799,
				nextDate: 1599642799,
				endDate: 1599642710,
				name: 'Salary',
				amount: 1500,
				budget: 'checking account',
				type: 'earning',
				category: 'Income',
				interval: 0,
				allocationOn: false
			}, {
				startDate: 1599642799,
				nextDate: 1599642799,
				endDate: 1599642710,
				name: 'Salary',
				amount: 1500,
				budget: 'saving account',
				type: 'earning',
				category: 'Income',
				interval: 2,
				allocationOn: false
			}];

			jsonStorage.writeMainStorage('recurring', testArr);

			budget.renameBudget('saving account', 'new account');

			testArr[1].budget = 'new account';

			assert.deepStrictEqual(jsonStorage.readMainStorage('recurring'), testArr);
		});
	});

	describe('#deleteBudget()', function() {
		it('should do nothing when trying to delete a budget which does not exist', function() {
			budget.addBudget('saving account');
			budget.deleteBudget('new account');

			assert.deepStrictEqual(jsonStorage.readMainStorage('budgets'), [['checking account', 0], ['saving account', 0]]);
			assert.deepStrictEqual(jsonStorage.readMainStorage('allTimeEarnings'), [['checking account', 0], ['saving account', 0]]);
			assert.deepStrictEqual(jsonStorage.readMainStorage('allTimeSpendings'), [['checking account', 0], ['saving account', 0]]);
			assert.deepStrictEqual(jsonStorage.readMainStorage('allocation'), [['checking account', 100], ['saving account', 0]]);
		});

		it('should update the mainstorage correctly', function() {
			budget.addBudget('new account');
			budget.addBudget('saving account');
			budget.deleteBudget('new account');

			assert.deepStrictEqual(jsonStorage.readMainStorage('budgets'), [['checking account', 0], ['saving account', 0]]);
			assert.deepStrictEqual(jsonStorage.readMainStorage('allTimeEarnings'), [['checking account', 0], ['saving account', 0]]);
			assert.deepStrictEqual(jsonStorage.readMainStorage('allTimeSpendings'), [['checking account', 0], ['saving account', 0]]);
			assert.deepStrictEqual(jsonStorage.readMainStorage('allocation'), [['checking account', 100], ['saving account', 0]]);
		});

		it('should update recurring transactions correctly', function() {
			budget.addBudget('saving account');
			assert.deepStrictEqual(jsonStorage.readMainStorage('budgets'), [['checking account', 0], ['saving account', 0]]);
			assert.deepStrictEqual(jsonStorage.readMainStorage('allTimeEarnings'), [['checking account', 0], ['saving account', 0]]);
			assert.deepStrictEqual(jsonStorage.readMainStorage('allTimeSpendings'), [['checking account', 0], ['saving account', 0]]);
			assert.deepStrictEqual(jsonStorage.readMainStorage('allocation'), [['checking account', 100], ['saving account', 0]]);

			jsonStorage.writeMainStorage('recurring', [{
				startDate: 1599642796,
				nextDate: 1599642796,
				endDate: 1599642796,
				name: 'Salary',
				amount: 1500,
				budget: 'saving account',
				type: 'earning',
				category: 'Income',
				interval: 0, // every 7 days
				allocationOn: true
			}]);

			budget.deleteBudget('saving account');
			assert.deepStrictEqual(jsonStorage.readMainStorage('recurring'), []);
		});

		it('should update data entries correctly', function() {
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
				budget: 'saving account',
				type: 'earning',
				category: 'Income'
			};

			let transact = new Transact(jsonStorage);

			budget.addBudget('saving account');
			transact.addEarningSingle(testObj1);
			transact.addEarningSingle(testObj2);

			assert.deepStrictEqual(jsonStorage.readJsonFile('/tmp/financelist/09.2020.json'), [testObj1, testObj2]);
			assert.deepStrictEqual(jsonStorage.readMainStorage('budgets'), [['checking account', 500.55], ['saving account', 500.55]]);
			assert.deepStrictEqual(jsonStorage.readMainStorage('allTimeEarnings'), [['checking account', 500.55], ['saving account', 500.55]]);
			assert.deepStrictEqual(jsonStorage.readMainStorage('allTimeSpendings'), [['checking account', 0], ['saving account', 0]]);
			assert.deepStrictEqual(jsonStorage.readMainStorage('allocation'), [['checking account', 100], ['saving account', 0]]);

			budget.deleteBudget('saving account');

			assert.deepStrictEqual(jsonStorage.readJsonFile('/tmp/financelist/09.2020.json'), [testObj1]);
			assert.deepStrictEqual(jsonStorage.readMainStorage('budgets'), [['checking account', 500.55]]);
			assert.deepStrictEqual(jsonStorage.readMainStorage('allTimeEarnings'), [['checking account', 500.55]]);
			assert.deepStrictEqual(jsonStorage.readMainStorage('allTimeSpendings'), [['checking account', 0]]);
			assert.deepStrictEqual(jsonStorage.readMainStorage('allocation'), [['checking account', 100]]);
		});

		it('should update allocation correctly', function() {
			budget.addBudget('saving account');
			jsonStorage.writeMainStorage('allocation', [['checking account', 30], ['saving account', 70]]);

			assert.deepStrictEqual(jsonStorage.readMainStorage('budgets'), [['checking account', 0], ['saving account', 0]]);
			assert.deepStrictEqual(jsonStorage.readMainStorage('allTimeEarnings'), [['checking account', 0], ['saving account', 0]]);
			assert.deepStrictEqual(jsonStorage.readMainStorage('allTimeSpendings'), [['checking account', 0], ['saving account', 0]]);
			assert.deepStrictEqual(jsonStorage.readMainStorage('allocation'), [['checking account', 30], ['saving account', 70]]);

			// Allocation must sum up to 100 percent, i.e., after deleting, checking account must be at 100 again
			budget.deleteBudget('saving account');
			
			assert.deepStrictEqual(jsonStorage.readMainStorage('budgets'), [['checking account', 0]]);
			assert.deepStrictEqual(jsonStorage.readMainStorage('allTimeEarnings'), [['checking account', 0]]);
			assert.deepStrictEqual(jsonStorage.readMainStorage('allTimeSpendings'), [['checking account', 0]]);
			assert.deepStrictEqual(jsonStorage.readMainStorage('allocation'), [['checking account', 100]]);
		});
	});
});