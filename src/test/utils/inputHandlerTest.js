const assert = require('assert');
const JsonStorage = require(__dirname + '/../../app/scripts/storage/jsonStorage.js');
const InputHandler = require(__dirname + '/../../app/scripts/utils/inputHandler.js');

const {unlinkSync} = require('fs');

describe('InputHandler', function() {
	let jsonStorage = new JsonStorage();
	let inputHandler = new InputHandler(jsonStorage);

	before(function() {
		path = jsonStorage.readPreference('path');
		jsonStorage.storePreference('path', __dirname);
	});

	after(function() {
		jsonStorage.storePreference('path', path);

		unlinkSync(__dirname + '/mainstorage.json');
	});

	describe('#isValidBudgetName()', function() {
		it('should reject wrong budget names', function() {
			assert.strictEqual(inputHandler.isValidBudgetName('checking account'), false); // Name is already taken
			assert.strictEqual(inputHandler.isValidBudgetName(''), false);
			assert.strictEqual(inputHandler.isValidBudgetName(null), false);
			assert.strictEqual(inputHandler.isValidBudgetName(undefined), false);
			assert.strictEqual(inputHandler.isValidBudgetName('$&§$%'), false);
			assert.strictEqual(inputHandler.isValidBudgetName('   '), false);

			let longName = new Array(inputHandler.maxSwLen + 1).fill(0).join('');
			assert.strictEqual(inputHandler.isValidBudgetName(longName), false);
		});

		it('should accept correct budget names', function() {
			assert.strictEqual(inputHandler.isValidBudgetName('New budget'), true);
			assert.strictEqual(inputHandler.isValidBudgetName('New budget with numbers 123'), true);
			assert.strictEqual(inputHandler.isValidBudgetName('12345'), true);
			assert.strictEqual(inputHandler.isValidBudgetName('A1B2 3C'), true);
		});
	});

	describe('#isValidEntryName()', function() {
		it('should reject wrong entry names', function() {
			assert.strictEqual(inputHandler.isValidEntryName(''), false);
			assert.strictEqual(inputHandler.isValidEntryName(null), false);
			assert.strictEqual(inputHandler.isValidEntryName(undefined), false);
			assert.strictEqual(inputHandler.isValidEntryName('$&§$%'), false);
			assert.strictEqual(inputHandler.isValidEntryName('   '), false);

			let longWord = new Array(inputHandler.maxSwLen + 1).fill(0).join('');
			assert.strictEqual(inputHandler.isValidEntryName(longWord), false);
			
			let reallyLongName = new Array(inputHandler.maxStrLen + 1).fill(0).join('');
			assert.strictEqual(inputHandler.isValidEntryName(reallyLongName), false);
		});

		it('should accept correct entry names', function() {
			assert.strictEqual(inputHandler.isValidEntryName('New entry'), true);
			assert.strictEqual(inputHandler.isValidEntryName('New entry with numbers 123'), true);
			assert.strictEqual(inputHandler.isValidEntryName('12345'), true);
			assert.strictEqual(inputHandler.isValidEntryName('A1B2 3C'), true);

			let longWord = new Array(inputHandler.maxSwLen).fill('a').join('');
			assert.strictEqual(inputHandler.isValidEntryName(`${longWord} abc`), true);
		});
	});

	describe('#isValidAmount()', function() {
		it('should reject wrong amounts', function() {
			assert.strictEqual(inputHandler.isValidAmount('', false), false, 'Test Pre 1 failed.');
			assert.strictEqual(inputHandler.isValidAmount(''), false, 'Test Pre 2 failed.');

			[true, false].forEach(emptyOk => {
				assert.strictEqual(inputHandler.isValidAmount(null, emptyOk), false, 'Test 1 failed.');
				assert.strictEqual(inputHandler.isValidAmount(undefined, emptyOk), false, 'Test 2 failed.');
				assert.strictEqual(inputHandler.isValidAmount('a', emptyOk), false, 'Test 3 failed.');
				assert.strictEqual(inputHandler.isValidAmount('12.12b', emptyOk), false, 'Test 4 failed.');
				assert.strictEqual(inputHandler.isValidAmount('12a', emptyOk), false, 'Test 5 failed.');
				assert.strictEqual(inputHandler.isValidAmount('a43', emptyOk), false, 'Test 6 failed.');
				assert.strictEqual(inputHandler.isValidAmount('a43.43', emptyOk), false, 'Test 7 failed.');
				assert.strictEqual(inputHandler.isValidAmount('44.4.4', emptyOk), false, 'Test 8 failed.');
				assert.strictEqual(inputHandler.isValidAmount('44.3,4', emptyOk), false, 'Test 9 failed.');
				assert.strictEqual(inputHandler.isValidAmount('44,3,4', emptyOk), false, 'Test 10 failed.');
				assert.strictEqual(inputHandler.isValidAmount('33.344', emptyOk), false, 'Test 11 failed.');
				assert.strictEqual(inputHandler.isValidAmount('34,666', emptyOk), false, 'Test 12 failed.');
				assert.strictEqual(inputHandler.isValidAmount('-5', emptyOk), false, 'Test 13 failed.');
				assert.strictEqual(inputHandler.isValidAmount('-5.5', emptyOk), false, 'Test 14 failed.');
				assert.strictEqual(inputHandler.isValidAmount('-5,5', emptyOk), false, 'Test 15 failed.');
			});
		});

		it('should accept correct amounts', function() {
			assert.strictEqual(inputHandler.isValidAmount('', true), true, 'Test Pre failed.');

			[true, false].forEach(emptyOk => {
				assert.strictEqual(inputHandler.isValidAmount('0', emptyOk), true, 'Test 1 failed.');
				assert.strictEqual(inputHandler.isValidAmount('1.1', emptyOk), true, 'Test 2 failed.');
				assert.strictEqual(inputHandler.isValidAmount('1.10', emptyOk), true, 'Test 3 failed.');
				assert.strictEqual(inputHandler.isValidAmount('.1', emptyOk), true, 'Test 4 failed.');
				assert.strictEqual(inputHandler.isValidAmount('1,1', emptyOk), true, 'Test 5 failed.');
				assert.strictEqual(inputHandler.isValidAmount('1,10', emptyOk), true, 'Test 6 failed.');
				assert.strictEqual(inputHandler.isValidAmount(',1', emptyOk), true, 'Test 7 failed.');
				assert.strictEqual(inputHandler.isValidAmount('10000000', emptyOk), true, 'Test 8 failed.');
				assert.strictEqual(inputHandler.isValidAmount('555.55', emptyOk), true, 'Test 9 failed.');
				assert.strictEqual(inputHandler.isValidAmount('555,55', emptyOk), true, 'Test 10 failed.');
				assert.strictEqual(inputHandler.isValidAmount('555,', emptyOk), true, 'Test 11 failed.');
				assert.strictEqual(inputHandler.isValidAmount('555.', emptyOk), true, 'Test 12 failed.');
			});
		});
	});
});