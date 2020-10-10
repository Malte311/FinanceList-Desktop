const assert = require('assert');
const Data = require(__dirname + '/../../app/scripts/handle/data.js');
const DataHandler = require(__dirname + '/../../app/scripts/handle/dataHandler.js');
const JsonStorage = require(__dirname + '/../../app/scripts/storage/jsonStorage.js');

const {appendFileSync, existsSync, mkdirSync, rmdirSync, unlinkSync, writeFileSync} = require('fs');

describe('DataHandler', function() {
	let jsonStorage = new JsonStorage();
	let dataHandler = new DataHandler(new Data(jsonStorage));
	let path;

	before(function() {
		path = jsonStorage.readPreference('path');
		jsonStorage.storePreference('path', '/tmp/financelist');

		if (!existsSync('/tmp/financelist/')) {
			mkdirSync('/tmp/financelist/');
		}

		appendFileSync(
			'/tmp/financelist/test.json',
			JSON.stringify(require(__dirname + '/dataTestHelper.js'), null, 4),
			{encoding: 'utf-8'}
		);
	});

	after(function() {
		jsonStorage.storePreference('path', path);

		if (existsSync('/tmp/financelist/test.json')) {
			unlinkSync('/tmp/financelist/test.json');
		}

		if (existsSync('/tmp/financelist/')) {
			rmdirSync('/tmp/financelist/', {recursive: true});
		}
	});

	describe('#getMonthlySum()', function() {
		it('should compute the correct sum', function() {
			assert.strictEqual(dataHandler.getMonthlySum('checking account', 'earning', '/test.json'), 1550.5);
			assert.strictEqual(dataHandler.getMonthlySum('saving account', 'earning', '/test.json'), 550.6);
			assert.strictEqual(dataHandler.getMonthlySum('checking account', 'spending', '/test.json'), 35.49);
			assert.strictEqual(dataHandler.getMonthlySum('saving account', 'spending', '/test.json'), 100);
		});
	});

	describe('#getRecentTrans()', function() {
		it('should filter the most recent transactions', function() {
			assert.deepStrictEqual(dataHandler.getRecentTrans(3, 'earning'), [{
				"date": 1600500309,
				"name": "eBay Sale",
				"amount": 80,
				"budget": "checking account, saving account",
				"type": "earning",
				"category": "Sales"
			}, {
				"date": 1599170400,
				"name": "Salary",
				"amount": 2000,
				"budget": "checking account, saving account",
				"type": "earning",
				"category": "Income"
			}, {
				"date": 1598995600,
				"name": "eBay Sale",
				"amount": 21.1,
				"budget": "checking account, saving account",
				"type": "earning",
				"category": "Sales"
			}]);

			assert.deepStrictEqual(dataHandler.getRecentTrans(3, 'spending'), [{
				"date": 1600423625,
				"name": "Hair salon",
				"amount": 18,
				"budget": "checking account",
				"type": "spending",
				"category": "Personal care"
			}, {
				"date": 1599642796,
				"name": "Apple Music",
				"amount": 9.99,
				"budget": "checking account",
				"type": "spending",
				"category": "Subscriptions"
			}, {
				"date": 1599429600,
				"name": "Saving",
				"amount": 50,
				"budget": "saving account",
				"type": "spending",
				"category": "Retirement"
			}]);
		});

		it('should work for entries which are not sorted', function() {
			writeFileSync(
				'/tmp/financelist/test.json',
				JSON.stringify([{
					"date": 4599642796,
					"name": "Apple Music",
					"amount": 9.99,
					"budget": "checking account",
					"type": "spending",
					"category": "Subscriptions"
				}, {
					"date": 3598997600,
					"name": "Hair salon",
					"amount": 18,
					"budget": "checking account",
					"type": "spending",
					"category": "Personal care"
				}, {
					"date": 2599642796,
					"name": "Apple Music",
					"amount": 9.99,
					"budget": "checking account",
					"type": "spending",
					"category": "Subscriptions"
				}], null, 4),
				{encoding: 'utf-8'}
			);

			assert.deepStrictEqual(dataHandler.getRecentTrans(3, 'spending'), [{
				"date": 4599642796,
				"name": "Apple Music",
				"amount": 9.99,
				"budget": "checking account",
				"type": "spending",
				"category": "Subscriptions"
			}, {
				"date": 3598997600,
				"name": "Hair salon",
				"amount": 18,
				"budget": "checking account",
				"type": "spending",
				"category": "Personal care"
			}, {
				"date": 2599642796,
				"name": "Apple Music",
				"amount": 9.99,
				"budget": "checking account",
				"type": "spending",
				"category": "Subscriptions"
			}]);
		});
	});
});