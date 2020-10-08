const assert = require('assert');
const Entry = require(__dirname + '/../../app/scripts/handle/entry.js');
const JsonStorage = require(__dirname + '/../../app/scripts/storage/jsonStorage.js');

describe('Entry', function() {
	let jsonStorage = new JsonStorage();
	let entry = new Entry(jsonStorage);

	describe('#editEntry', function() {
		it('', function() {
			throw new Error('TODO');
		});
	});

	describe('#deleteEntry', function() {
		it('', function() {
			throw new Error('TODO');
		});
	});
});