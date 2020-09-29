const assert = require('assert');
const Transact = require(__dirname + '/../../app/scripts/handle/transact.js');
const JsonStorage = require(__dirname + '/../../app/scripts/storage/jsonStorage.js');

const {unlinkSync} = require('fs');

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
	});

	after(function() {
		jsonStorage.storePreference('path', path);

		unlinkSync(__dirname + '/mainstorage.json');
	});

	afterEach(function() {
		unlinkSync(__dirname + '/09.2020.json');
	});

	describe('#addEarning()', function() {
		it('should add a single entry correctly', function() {
			
		});

		it('should add multiple entries correctly', function() {
			
		});

		it('should work correctly together with addSpending()', function() {
			
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

			// assert.strictEqual(recurring.length, 1);
			// assert.strictEqual(jsonStorage.readMainStorage('budgets')[0][1], 0);
			// assert.strictEqual(jsonStorage.readMainStorage('allTimeEarnings')[0][1], 0);
			// assert.strictEqual(jsonStorage.readMainStorage('allTimeSpendings')[0][1], 0);
			// assert.deepStrictEqual(recurring[0], testObj);
		});

		it('should add multiple entries correctly', function() {
			
		});

		it('should work correctly together with addEarning()', function() {
			
		});
	});
});