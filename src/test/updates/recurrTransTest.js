const assert = require('assert');
const JsonStorage = require(__dirname + '/../../app/scripts/storage/jsonStorage.js');
const RecurrTrans = require(__dirname + '/../../app/scripts/updates/recurrTrans.js');

const {unlinkSync} = require('fs');

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
	});

	after(function() {
		jsonStorage.storePreference('path', path);

		unlinkSync(__dirname + '/mainstorage.json');
	});

	describe('#execRecurrTransact()', function() {
		it('', function() {
			throw new Error();
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
			let startDate = (Date.now() / 1000) - 600; // 10 min in the past
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
			assert.deepStrictEqual(recurring[0], testObj);
			assert.strictEqual((new Date(recurring[0].nextDate * 1000).getMonth(), startDate.getMonth() + 1));
		});
	});

	describe('#editRecurringTransaction()', function() {
		it('', function() {
			throw new Error();
		});
	});

	describe('#deleteRecurringTransaction()', function() {
		it('', function() {
			throw new Error();
		});
	});
});