const assert = require('assert');
const Budget = require(__dirname + '/../../app/scripts/handle/budget.js');
const JsonStorage = require(__dirname + '/../../app/scripts/storage/jsonStorage.js');

const {existsSync, mkdirSync, rmdirSync, unlinkSync} = require('fs');

describe('Budget', function() {
	let jsonStorage = new JsonStorage();
	let budget = new Budget(jsonStorage);
	let path;

	before(function() {
		path = jsonStorage.readPreference('path');

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
		it('should rename the correct budget', function() {
			
		});
	});

	describe('#deleteBudget()', function() {
		it('should do nothing when trying to delete a budget which does not exist', function() {
			
		});

		it('should delete the correct budget', function() {
			
		});
	});
});