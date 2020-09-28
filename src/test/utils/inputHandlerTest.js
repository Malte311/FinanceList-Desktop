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

			let longName = new Array(inputHandler.maxSwLen + 1).fill(0).join();
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
			
		});

		it('should accept correct entry names', function() {
			
		});
	});
});