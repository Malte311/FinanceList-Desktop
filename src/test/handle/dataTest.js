const assert = require('assert');
const Data = require(__dirname + '/../../app/scripts/handle/data.js');
const JsonStorage = require(__dirname + '/../../app/scripts/storage/jsonStorage.js');

describe('Data', function() {
	let data = new Data(new JsonStorage());

	describe('#getData()', function() {
		it('', function() {

		});
	});

	describe('#getDataReduce()', function() {
		it('', function() {

		});
	});

	describe('#mergeData()', function() {
		it('should do nothing for empty arrays', function() {
			assert.deepStrictEqual([], data.mergeData([]));
		});

		it('should return the unchanged input if no data to merge is contained', function() {
			let testArr = require(__dirname + '/dataTestHelper.js');
			let newTestArr = testArr.filter((value, index, array) => {
				return array.map(obj => obj.date).indexOf(value.date) === index; // Unique dates
			});

			assert.deepStrictEqual(newTestArr, data.mergeData(newTestArr));
		});

		it('should merge entries if they share the same date', function() {
			let testArr = require(__dirname + '/dataTestHelper.js');
			let uniqueTestArr = require(__dirname + '/dataTestHelperUnique.js');

			assert.deepStrictEqual(uniqueTestArr, data.mergeData(testArr));
		});
	});

	describe('#joinData()', function() {
		it('should join entries at the beginning of the data array', function() {
			let testArr = require(__dirname + '/dataTestHelper.js');
			let resultObj = {
				"date": 1598995600,
				"name": "eBay Sale",
				"amount": 21.1,
				"budget": "checking account, saving account",
				"type": "earning",
				"category": "Sales"
			};

			assert.deepStrictEqual(resultObj, data.joinData([0, 1], testArr));
		});

		it('should join entries anywhere in the data array', function() {
			let testArr = require(__dirname + '/dataTestHelper.js');
			let resultObj = {
				"date": 1599170400,
				"name": "Salary",
				"amount": 2000,
				"budget": "checking account, saving account",
				"type": "earning",
				"category": "Income"
			};

			assert.deepStrictEqual(resultObj, data.joinData([4, 5], testArr));
		});

		it('should join entries at the end of the data array', function() {
			let testArr = require(__dirname + '/dataTestHelper.js');
			let resultObj = {
				"date": 1600500309,
				"name": "eBay Sale",
				"amount": 80,
				"budget": "checking account, saving account",
				"type": "earning",
				"category": "Sales"
			};

			assert.deepStrictEqual(resultObj, data.joinData([11, 12], testArr));
		});

		it('should return an empty object for an empty array as input', function() {
			let testArr = require(__dirname + '/dataTestHelper.js');
			assert.deepStrictEqual({}, data.joinData([], testArr));
		});
	});

	describe('#sortData()', function() {
		it('should keep correctly sorted data in the right order', function() {
			let testArr = require(__dirname + '/dataTestHelper.js');
			assert.deepStrictEqual(testArr, data.sortData(testArr));
		});

		it('should reverse data sorted in the wrong direction', function() {
			let testArr = require(__dirname + '/dataTestHelper.js');
			let newTestArr = testArr.reverse();
			assert.deepStrictEqual(testArr, data.sortData(newTestArr));
		});

		it('should sort data ascending by date', function() {
			let testArr = require(__dirname + '/dataTestHelper.js');
			let newTestArr = require(__dirname + '/dataTestHelper.js');
			let swaps = [[0, 3], [1, 5], [2, 4], [7, 8]];

			swaps.forEach(swap => {
				let tmp = newTestArr[swap[0]];
				newTestArr[swap[0]] = newTestArr[swap[1]];
				newTestArr[swap[1]] = tmp;
			});

			assert.deepStrictEqual(testArr, data.sortData(newTestArr));
		});

		it('should return an empty array for empty array inputs', function() {
			assert.deepStrictEqual([], data.sortData([]));
		});
	});
});