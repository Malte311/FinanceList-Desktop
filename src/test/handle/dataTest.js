const assert = require('assert');
const Data = require(__dirname + '/../../app/scripts/handle/data.js');
const JsonStorage = require(__dirname + '/../../app/scripts/storage/jsonStorage.js');

describe('Data', function() {
	let data = new Data(new JsonStorage());

	let testObj = require(__dirname + '/dataTestHelper.js');

	describe('#getData()', function() {
		it('', function() {
			
		});

		it('', function() {
			
		});

		it('', function() {
			
		});
	});

	describe('#sortData()', function() {
		it('should keep correctly sorted data in the right order', function() {
			assert.deepStrictEqual(testObj, data.sortData(testObj));
		});

		it('should reverse data sorted in the wrong direction', function() {
			let newTestObj = testObj.reverse();
			assert.deepStrictEqual(testObj, data.sortData(newTestObj));
		});

		it('should sort data ascending by date', function() {
			let newTestObj = require(__dirname + '/dataTestHelper.js');
			let swaps = [[0, 3], [1, 5], [2, 4], [7, 8]];

			swaps.forEach(swap => {
				let tmp = newTestObj[swap[0]];
				newTestObj[swap[0]] = newTestObj[swap[1]];
				newTestObj[swap[1]] = tmp;
			});

			assert.deepStrictEqual(testObj, data.sortData(newTestObj));
		});
	});
});