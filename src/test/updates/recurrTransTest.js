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
		it('', function() {
			throw new Error();
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