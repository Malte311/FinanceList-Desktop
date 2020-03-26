const assert = require('assert');
const DateHandler = require('../../app/scripts/utils/dateHandler.js');

describe('DateHandler', function() {
	let dH = new DateHandler();

	describe('#timeStampToString()', function() {
		it('returns the correct string for single digit month and double digit day', function() {
			assert.equal(dH.timestampToString(new Date('2020-02-29').getTime() / 1000), '29.02.2020');
		});

		it('returns the correct string for single digit day and double digit month', function() {
			assert.equal(dH.timestampToString(new Date('1999-12-05').getTime() / 1000), '05.12.1999');
		});

		it('returns the correct string for both single digit day and month', function() {
			assert.equal(dH.timestampToString(new Date('2050-01-01').getTime() / 1000), '01.01.2050');
		});

		it('returns the correct string for both double digit day and month', function() {
			assert.equal(dH.timestampToString(new Date('2222-11-11').getTime() / 1000), '11.11.2222');
		});
	});
});