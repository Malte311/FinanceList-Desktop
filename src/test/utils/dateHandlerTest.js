const assert = require('assert');
const DateHandler = require(__dirname + '/../../app/scripts/utils/dateHandler.js');
const JsonStorage = require(__dirname + '/../../app/scripts/storage/jsonStorage.js');

const {appendFileSync, unlinkSync} = require('fs');

describe('DateHandler', function() {
	let jsonStorage = new JsonStorage();

	let ts = 1600500309;
	let path;

	before(function() {
		path = jsonStorage.readPreference('path');

		appendFileSync(
			__dirname + '/' + DateHandler.timestampToFilename(ts),
			JSON.stringify(require(__dirname + '/dateHandlerTestHelper.js'), null, 4),
			{encoding: 'utf-8'}
		);
	});

	after(function() {
		jsonStorage.storePreference('path', path);

		unlinkSync(__dirname + '/' + DateHandler.timestampToFilename(ts));
	});

	describe('#getCurrentTimestamp()', function() {
		it('returns the correct date', function() {
			let today = Date.now() / 1000;

			assert.strictEqual(
				DateHandler.timestampToString(DateHandler.getCurrentTimestamp()),
				DateHandler.timestampToString(today)
			);
		});
	});

	describe('#timeStampToString()', function() {
		it('returns the correct string for single digit month and double digit day', function() {
			let result = DateHandler.timestampToString(new Date('2020-02-29').getTime() / 1000);
			assert.strictEqual(result, '29.02.2020');
		});

		it('returns the correct string for single digit day and double digit month', function() {
			let result = DateHandler.timestampToString(new Date('1999-12-05').getTime() / 1000);
			assert.strictEqual(result, '05.12.1999');
		});

		it('returns the correct string for both single digit day and month', function() {
			let result = DateHandler.timestampToString(new Date('2050-01-01').getTime() / 1000);
			assert.strictEqual(result, '01.01.2050');
		});

		it('returns the correct string for both double digit day and month', function() {
			let result = DateHandler.timestampToString(new Date('2222-11-11').getTime() / 1000);
			assert.strictEqual(result, '11.11.2222');
		});
	});

	describe('#createUniqueTimestamp()', function() {
		it('should create unique timestamps', function() {
			jsonStorage.storePreference('path', __dirname);

			assert.strictEqual(DateHandler.createUniqueTimestamp(ts, jsonStorage), 1600500311);
		});
	});

	describe('#strDateToFilename()', function() {
		it('returns the correct filename', function() {
			assert.strictEqual(DateHandler.strDateToFilename('29.02.2020'), '02.2020.json');
			assert.strictEqual(DateHandler.strDateToFilename('01.02.2020'), '02.2020.json');
			assert.strictEqual(DateHandler.strDateToFilename('01.01.2020'), '01.2020.json');
			assert.strictEqual(DateHandler.strDateToFilename('31.12.2020'), '12.2020.json');
		});
	});

	describe('#timestampToFilename()', function() {
		it('returns the correct filename', function() {
			let ts1 = (new Date('2020-02-29')).getTime() / 1000;
			assert.strictEqual(DateHandler.timestampToFilename(ts1), '02.2020.json');

			let ts2 = (new Date('2020-01-01')).getTime() / 1000;
			assert.strictEqual(DateHandler.timestampToFilename(ts2), '01.2020.json');

			let ts3 = (new Date('2015-12-31')).getTime() / 1000;
			assert.strictEqual(DateHandler.timestampToFilename(ts3), '12.2015.json');
		});
	});
});