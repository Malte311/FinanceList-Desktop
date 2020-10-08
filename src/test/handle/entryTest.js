const assert = require('assert');
const Entry = require(__dirname + '/../../app/scripts/handle/entry.js');
const JsonStorage = require(__dirname + '/../../app/scripts/storage/jsonStorage.js');

const {existsSync, mkdirSync, rmdirSync, unlinkSync} = require('fs');

describe('Entry', function() {
	let jsonStorage = new JsonStorage();
	let entry = new Entry(jsonStorage);
	let path;

	before(function() {
		path = jsonStorage.readPreference('path');

		jsonStorage.storePreference('path', '/tmp/financelist');

		if (!existsSync('/tmp/financelist/')) {
			mkdirSync('/tmp/financelist/');
		}
	});

	after(function() {
		jsonStorage.storePreference('path', path);

		if (existsSync('/tmp/financelist/')) {
			rmdirSync('/tmp/financelist/', {recursive: true});
		}
	});

	afterEach(function() {
		if (existsSync('/tmp/financelist/09.2020.json')) {
			unlinkSync('/tmp/financelist/09.2020.json');
		}
	});

	let testArr = [{
		"date": 1598995600, // 09.2020
		"name": "Bus ticket",
		"amount": 2.5,
		"budget": "checking account",
		"type": "spending",
		"category": "Tickets"
	}, {
		"date": 1598997600, // 09.2020
		"name": "Bus ticket",
		"amount": 2.5,
		"budget": "checking account",
		"type": "spending",
		"category": "Tickets"
	}];

	describe('#editEntry', function() {
		it('should do nothing when trying to edit a non-existing entry', function() {
			testArr.forEach(obj => jsonStorage.storeData(obj));
			assert.deepStrictEqual(jsonStorage.readJsonFile('/tmp/financelist/09.2020.json'), testArr);

			entry.editEntry(1598995699, {name: 'ABC'});
			entry.editEntry(0, {name: 'ABC'});
			entry.editEntry(-1, {name: 'ABC'});

			assert.deepStrictEqual(jsonStorage.readJsonFile('/tmp/financelist/09.2020.json'), testArr);
		});

		it('should edit the correct entry correctly', function() {
			let testArrCopy = JSON.parse(JSON.stringify(testArr));

			testArrCopy.forEach(obj => jsonStorage.storeData(obj));
			assert.deepStrictEqual(jsonStorage.readJsonFile('/tmp/financelist/09.2020.json'), testArrCopy);
			
			entry.editEntry(1598997600, {date: 1598997600, name: 'ABC', category: 'DEF'});
			testArrCopy[1].date = 1598997601;
			testArrCopy[1].name = 'ABC';
			testArrCopy[1].category = 'DEF';
			assert.deepStrictEqual(jsonStorage.readJsonFile('/tmp/financelist/09.2020.json'), testArrCopy);

			entry.editEntry(1598995600, {date: 1598995600, name: 'Bus ticket', category: 'Tickets'});
			testArrCopy[0].date = 1598995601;
			assert.deepStrictEqual(jsonStorage.readJsonFile('/tmp/financelist/09.2020.json'), testArrCopy);
			
			entry.editEntry(1598997601, {date: 1598997601, name: 'Bus ticket', category: 'Tickets'});
			testArrCopy[1].date = 1598997602;
			testArrCopy[1].name = 'Bus ticket';
			testArrCopy[1].category = 'Tickets';
			assert.deepStrictEqual(jsonStorage.readJsonFile('/tmp/financelist/09.2020.json'), testArrCopy);
		});
	});

	describe('#deleteEntry', function() {
		it('should do nothing when trying to delete a non-existing entry', function() {
			testArr.forEach(obj => jsonStorage.storeData(obj));
			assert.deepStrictEqual(jsonStorage.readJsonFile('/tmp/financelist/09.2020.json'), testArr);

			entry.deleteEntry(1598995699);
			entry.deleteEntry(0);
			entry.deleteEntry(-1);

			assert.deepStrictEqual(jsonStorage.readJsonFile('/tmp/financelist/09.2020.json'), testArr);
		});

		it('should delete the correct entry', function() {
			testArr.forEach(obj => jsonStorage.storeData(obj));
			assert.deepStrictEqual(jsonStorage.readJsonFile('/tmp/financelist/09.2020.json'), testArr);

			entry.deleteEntry(1598997600);
			assert.deepStrictEqual(jsonStorage.readJsonFile('/tmp/financelist/09.2020.json'), [testArr[0]]);

			entry.deleteEntry(1598995600);
			assert.deepStrictEqual(jsonStorage.readJsonFile('/tmp/financelist/09.2020.json'), []);
		});
	});
});