const assert = require('assert');
const JsonStorage = require(__dirname + '/../../app/scripts/storage/jsonStorage.js');
const InputHandler = require(__dirname + '/../../app/scripts/utils/inputHandler.js');

const {unlinkSync, mkdirSync, rmdirSync, existsSync} = require('fs');

describe('InputHandler', function() {
	let jsonStorage = new JsonStorage();
	let inputHandler = new InputHandler(jsonStorage);
	let path;
	let users;

	before(function() {
		path = jsonStorage.readPreference('path');
		users = jsonStorage.readPreference('users');
		jsonStorage.storePreference('path', '/tmp/financelist');
		jsonStorage.storePreference('users', ['Alice', 'Bob']);

		if (!existsSync('/tmp/financelist/')) {
			mkdirSync('/tmp/financelist/');
		}
	});

	after(function() {
		jsonStorage.storePreference('path', path);
		jsonStorage.storePreference('users', users);

		if (existsSync('/tmp/financelist/mainstorage.json')) {
			unlinkSync('/tmp/financelist/mainstorage.json');
		}

		if (existsSync('/tmp/financelist/')) {
			rmdirSync('/tmp/financelist/', {recursive: true});
		}
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
				assert.strictEqual(inputHandler.isValidAmount('1,1', emptyOk), false, 'Test 16 failed.');
				assert.strictEqual(inputHandler.isValidAmount('1,10', emptyOk), false, 'Test 17 failed.');
				assert.strictEqual(inputHandler.isValidAmount(',1', emptyOk), false, 'Test 18 failed.');
				assert.strictEqual(inputHandler.isValidAmount('555,', emptyOk), false, 'Test 19 failed.');
				assert.strictEqual(inputHandler.isValidAmount('555,55', emptyOk), false, 'Test 20 failed.');
			});
		});

		it('should accept correct amounts', function() {
			assert.strictEqual(inputHandler.isValidAmount('', true), true, 'Test Pre failed.');

			[true, false].forEach(emptyOk => {
				assert.strictEqual(inputHandler.isValidAmount('0', emptyOk), true, 'Test 1 failed.');
				assert.strictEqual(inputHandler.isValidAmount('1.1', emptyOk), true, 'Test 2 failed.');
				assert.strictEqual(inputHandler.isValidAmount('1.10', emptyOk), true, 'Test 3 failed.');
				assert.strictEqual(inputHandler.isValidAmount('.1', emptyOk), true, 'Test 4 failed.');
				assert.strictEqual(inputHandler.isValidAmount('10000000', emptyOk), true, 'Test 5 failed.');
				assert.strictEqual(inputHandler.isValidAmount('555.55', emptyOk), true, 'Test 6 failed.');
				assert.strictEqual(inputHandler.isValidAmount('555.', emptyOk), true, 'Test 7 failed.');
			});
		});
	});

	describe('#isValidDate()', function() {
		it('should reject invalid dates', function() {
			assert.strictEqual(inputHandler.isValidDate('0', '1', '2000'), false, 'Test 1 failed.');
			assert.strictEqual(inputHandler.isValidDate('32', '1', '2000'), false, 'Test 2 failed.');
			assert.strictEqual(inputHandler.isValidDate('15', '0', '2000'), false, 'Test 3 failed.');
			assert.strictEqual(inputHandler.isValidDate('15', '13', '2000'), false, 'Test 4 failed.');
			assert.strictEqual(inputHandler.isValidDate('15', '-1', '2000'), false, 'Test 5 failed.');
			assert.strictEqual(inputHandler.isValidDate('15', '13', '-2000'), false, 'Test 6 failed.');
			assert.strictEqual(inputHandler.isValidDate('-15', '13', '2000'), false, 'Test 7 failed.');
		});

		it('should accept correct dates', function() {
			assert.strictEqual(inputHandler.isValidDate('1', '1', '2000'), true, 'Test 1 failed.');
			assert.strictEqual(inputHandler.isValidDate('31', '1', '2000'), true, 'Test 2 failed.');
			assert.strictEqual(inputHandler.isValidDate('15', '02', '2000'), true, 'Test 3 failed.');
			assert.strictEqual(inputHandler.isValidDate('01', '01', '2000'), true, 'Test 4 failed.');
		});
	});

	describe('#isValidUserProfile()', function() {
		it('should reject invalid user profile names', function() {
			assert.strictEqual(inputHandler.isValidUserProfile(null), false, 'Test 1 failed.');
			assert.strictEqual(inputHandler.isValidUserProfile(undefined), false, 'Test 2 failed.');
			assert.strictEqual(inputHandler.isValidUserProfile(true), false, 'Test 3 failed.');
			assert.strictEqual(inputHandler.isValidUserProfile(''), false, 'Test 4 failed.');
			assert.strictEqual(inputHandler.isValidUserProfile('  '), false, 'Test 5 failed.');
			assert.strictEqual(inputHandler.isValidUserProfile('Test$'), false, 'Test 6 failed.');
			assert.strictEqual(inputHandler.isValidUserProfile('!?'), false, 'Test 7 failed.');
			assert.strictEqual(inputHandler.isValidUserProfile('Test Test'), false, 'Test 8 failed.');
		});

		it('should accept valid user profile names', function() {
			assert.strictEqual(inputHandler.isValidUserProfile('Test'), true, 'Test 1 failed.');
			assert.strictEqual(inputHandler.isValidUserProfile('Test '), true, 'Test 2 failed.');
			assert.strictEqual(inputHandler.isValidUserProfile(' Test'), true, 'Test 3 failed.');
			assert.strictEqual(inputHandler.isValidUserProfile(' Test '), true, 'Test 4 failed.');
			assert.strictEqual(inputHandler.isValidUserProfile('55'), true, 'Test 5 failed.');
			assert.strictEqual(inputHandler.isValidUserProfile('Test1'), true, 'Test 6 failed.');
		});

		it('should reject valid names which are already in use', function() {
			assert.strictEqual(inputHandler.isValidUserProfile('Alice'), false, 'Test 1 failed.');
			assert.strictEqual(inputHandler.isValidUserProfile('Alice '), false, 'Test 2 failed.');
			assert.strictEqual(inputHandler.isValidUserProfile(' Alice'), false, 'Test 3 failed.');
			assert.strictEqual(inputHandler.isValidUserProfile(' Alice '), false, 'Test 4 failed.');
			assert.strictEqual(inputHandler.isValidUserProfile('Bob'), false, 'Test 5 failed.');
		});
	});
});