const assert = require('assert');
const DateHandler = require(__dirname + '/../../app/scripts/utils/dateHandler.js');
const JsonStorage = require(__dirname + '/../../app/scripts/storage/jsonStorage.js');

const {appendFileSync, unlinkSync, mkdirSync, rmdirSync, existsSync} = require('fs');

describe('DateHandler', function() {
	let jsonStorage = new JsonStorage();

	let ts = 1600500309;
	let path;

	before(function() {
		path = jsonStorage.readPreference('path');

		if (!existsSync('/tmp/financelist/')) {
			mkdirSync('/tmp/financelist/');
		}
		
		appendFileSync(
			`/tmp/financelist/${DateHandler.timestampToFilename(ts)}`,
			JSON.stringify(require(__dirname + '/dateHandlerTestHelper.js'), null, 4),
			{encoding: 'utf-8'}
		);
	});

	after(function() {
		jsonStorage.storePreference('path', path);

		if (existsSync(`/tmp/financelist/${DateHandler.timestampToFilename(ts)}`)) {
			unlinkSync(`/tmp/financelist/${DateHandler.timestampToFilename(ts)}`);
		}
		
		if (existsSync('/tmp/financelist/')) {
			rmdirSync('/tmp/financelist/', {recursive: true});
		}
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
			jsonStorage.storePreference('path', '/tmp/financelist');

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

	describe('#dateToTimestamp()', function() {
		it('returns the correct timestamp', function() {
			let ts1 = (new Date('2020-02-29')).getTime() / 1000;
			assert.strictEqual(DateHandler.dateToTimestamp('29', '2', '2020'), ts1);

			let ts2 = (new Date('2020-01-01')).getTime() / 1000;
			assert.strictEqual(DateHandler.dateToTimestamp('1', '1', '2020'), ts2);

			let ts3 = (new Date('2015-12-31')).getTime() / 1000;
			assert.strictEqual(DateHandler.dateToTimestamp('31', '12', '2015'), ts3);
		});
	});

	describe('#stepInterval()', function() {
		let ts1 = (new Date('2020-02-29')).getTime() / 1000;
		let ts2 = (new Date('2015-12-31')).getTime() / 1000;

		it('should throw an error for invalid interval numbers', function() {
			assert.throws(() => { DateHandler.stepInterval(ts1, ts1, -1); }, Error, 'Test Pre 1 failed');
			assert.throws(() => { DateHandler.stepInterval(ts2, ts2, 7); }, Error, 'Test Pre 2 failed');
		});

		it('should handle valid intervals correctly', function() {
			assert.strictEqual(DateHandler.timestampToString(DateHandler.stepInterval(ts1, ts1, 0)), '07.03.2020', 'Test 1 failed');
			assert.strictEqual(DateHandler.timestampToString(DateHandler.stepInterval(ts1, ts1, 1)), '28.03.2020', 'Test 2 failed');
			assert.strictEqual(DateHandler.timestampToString(DateHandler.stepInterval(ts2, ts2, 0)), '07.01.2016', 'Test 3 failed');
			assert.strictEqual(DateHandler.timestampToString(DateHandler.stepInterval(ts2, ts2, 1)), '28.01.2016', 'Test 4 failed');
			assert.strictEqual(DateHandler.timestampToString(DateHandler.stepInterval(ts1, ts1, 2)), '29.03.2020', 'Test 5 failed');
			assert.strictEqual(DateHandler.timestampToString(DateHandler.stepInterval(ts2, ts2, 2)), '31.01.2016', 'Test 6 failed');
			assert.strictEqual(DateHandler.timestampToString(DateHandler.stepInterval(ts1, ts1, 3)), '29.04.2020', 'Test 7 failed');
			assert.strictEqual(DateHandler.timestampToString(DateHandler.stepInterval(ts2, ts2, 3)), '29.02.2016', 'Test 8 failed');
			assert.strictEqual(DateHandler.timestampToString(DateHandler.stepInterval(ts1, ts1, 4)), '29.05.2020', 'Test 9 failed');
			assert.strictEqual(DateHandler.timestampToString(DateHandler.stepInterval(ts2, ts2, 4)), '31.03.2016', 'Test 10 failed');
			assert.strictEqual(DateHandler.timestampToString(DateHandler.stepInterval(ts1, ts1, 5)), '29.08.2020', 'Test 11 failed');
			assert.strictEqual(DateHandler.timestampToString(DateHandler.stepInterval(ts2, ts2, 5)), '30.06.2016', 'Test 12 failed');
			assert.strictEqual(DateHandler.timestampToString(DateHandler.stepInterval(ts1, ts1, 6)), '28.02.2021', 'Test 13 failed');
			assert.strictEqual(DateHandler.timestampToString(DateHandler.stepInterval(ts2, ts2, 6)), '31.12.2016', 'Test 14 failed');
		});
	});

	describe('#stepIntervalDays()', function() {
		let ts1 = (new Date('2020-02-29')).getTime() / 1000;
		let ts2 = (new Date('2015-12-31')).getTime() / 1000;

		it('should throw an error for invalid interval numbers', function() {
			assert.throws(() => { DateHandler.stepIntervalDays(ts1, 2); }, Error, 'Test Pre 1 failed');
			assert.throws(() => { DateHandler.stepIntervalDays(ts2, -1); }, Error, 'Test Pre 2 failed');
		});

		it('should handle valid intervals correctly', function() {
			assert.strictEqual(DateHandler.timestampToString(DateHandler.stepIntervalDays(ts1, 0)), '07.03.2020', 'Test 1 failed');
			assert.strictEqual(DateHandler.timestampToString(DateHandler.stepIntervalDays(ts1, 1)), '28.03.2020', 'Test 2 failed');
			assert.strictEqual(DateHandler.timestampToString(DateHandler.stepIntervalDays(ts2, 0)), '07.01.2016', 'Test 3 failed');
			assert.strictEqual(DateHandler.timestampToString(DateHandler.stepIntervalDays(ts2, 1)), '28.01.2016', 'Test 4 failed');
		});
	});

	describe('#stepIntervalMonths()', function() {
		let ts1 = (new Date('2020-02-29')).getTime() / 1000;
		let ts2 = (new Date('2015-12-31')).getTime() / 1000;

		it('should throw an error for invalid interval numbers', function() {
			assert.throws(() => { DateHandler.stepIntervalMonths(ts1, ts1, 0); }, Error, 'Test Pre 1 failed');
			assert.throws(() => { DateHandler.stepIntervalMonths(ts2, ts2, 1); }, Error, 'Test Pre 2 failed');
			assert.throws(() => { DateHandler.stepIntervalMonths(ts2, ts2, -1); }, Error, 'Test Pre 3 failed');
			assert.throws(() => { DateHandler.stepIntervalMonths(ts1, ts1, 7); }, Error, 'Test Pre 4 failed');
		});

		it('should handle valid intervals correctly', function() {
			let ts3 = (new Date('2020-03-31')).getTime() / 1000;

			assert.strictEqual(DateHandler.timestampToString(DateHandler.stepIntervalMonths(ts3, ts3, 2)), '30.04.2020');
			assert.strictEqual(DateHandler.timestampToString(DateHandler.stepIntervalMonths(ts3, ts3, 3)), '31.05.2020');
			assert.strictEqual(DateHandler.timestampToString(DateHandler.stepIntervalMonths(ts3, ts3, 4)), '30.06.2020');
			assert.strictEqual(DateHandler.timestampToString(DateHandler.stepIntervalMonths(ts3, ts3, 5)), '30.09.2020');
			assert.strictEqual(DateHandler.timestampToString(DateHandler.stepIntervalMonths(ts3, ts3, 6)), '31.03.2021');
		});

		it('should handle multiple increments correctly', function() {
			let ts3 = (new Date('2020-03-31')).getTime() / 1000;

			// Incrementing by 1 month two times: Should be from 31.03 to 30.04 to 31.05
			assert.strictEqual(DateHandler.timestampToString(
				DateHandler.stepIntervalMonths(ts3, DateHandler.stepIntervalMonths(ts3, ts3, 2), 2)
			), '31.05.2020');

			assert.strictEqual(DateHandler.timestampToString(
				DateHandler.stepIntervalMonths(ts3, DateHandler.stepIntervalMonths(ts3, ts3, 6), 6)
			), '31.03.2022');
		});
	});
});