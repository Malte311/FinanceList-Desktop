/**
 * Class for dealing with times and dates.
 */
module.exports = class DateHandler {
	/**
	 * Returns a timestamp for the current time.
	 * 
	 * @return {number} A timestamp of the current date in seconds.
	 */
	static getCurrentTimestamp() {
		// Divide milliseconds by 1000 to get seconds.
		return Math.floor(Date.now() / 1000);
	}

	/**
	 * Converts a timestamp in seconds into a date in string format.
	 * 
	 * @param {number} ts The timestamp (in seconds) which we want to convert.
	 * @return {string} The formatted date (dd.mm.yyyy).
	 */
	static timestampToString(ts) {
		let date = new Date(ts * 1000); // Multiply by 1000 to get milliseconds from seconds.
		
		let day = date.getDate().toString().padStart(2, '0');
		let month = (date.getMonth() + 1).toString().padStart(2, '0'); // Month is zero indexed
		let year = date.getFullYear().toString();
		
		return `${day}.${month}.${year}`;
	}

	/**
	 * Makes sure that a given timestamp is not already used (unique).
	 * If it is already in use, we add iteratively one second to it until it is unique.
	 * 
	 * @param {number} ts The original timestamp.
	 * @param {Storage} storage A storage object for accessing the data.
	 * @return {number} A unique timestamp generated from the original timestamp.
	 */
	static createUniqueTimestamp(ts, storage) {		
		let content = storage.getData(DateHandler.timestampToFilename(ts), {
			connector: 'or',
			params: [['type', 'earning'], ['type', 'spending']]
		});

		// A single for-loop is sufficient because the file is sorted by date.
		// So if we add one, we can detect new duplicates in the following iterations
		// (and add one again until no duplicates are left).
		for (let i = 0; i < content.length; i++) {
			if (content[i].date === ts) {
				ts = ts + 1;
			}
		}

		return ts;
	}

	/**
	 * Creates a filename for a given date in string format.
	 * Input format: dd.mm.yyyy, output format: mm.yyyy.json
	 * 
	 * @param {string} date The date which should be reversed.
	 * @return {string} The filename for the given date in mm.yyyy.json format.
	 */
	static strDateToFilename(date) {
		let dSplit = date.split('.');

		return `${dSplit[1]}.${dSplit[2]}.json`;
	}

	/**
	 * Creates a filename for a given timestamp.
	 * Input: Timestamp in seconds, output format: mm.yyyy.json
	 * 
	 * @param {number} ts The timestamp for which we want to obtain the filename.
	 * @return {string} The filename for the given timestamp in mm.yyyy.json format.
	 */
	static timestampToFilename(ts) {
		return DateHandler.strDateToFilename(DateHandler.timestampToString(ts));
	}

	/**
	 * Increments a given date by a given interval.
	 * 
	 * @param {number} oldDate The date to increment as a timestamp in seconds.
	 * @param {number} interval The interval, in form of one of the following:
	 * 0 => one week (7 days),
	 * 1 => four weeks (28 days),
	 * 2 => one month,
	 * 3 => two months,
	 * 4 => three months (quarterly),
	 * 5 => six months (biannual),
	 * 6 => one year (annual)
	 */
	static stepInterval(oldDate, interval) {
		// Alternative: Use timestampToStr and manipulate the digits in it

		if (interval === 0 || interval === 1) {
			return stepIntervalDays(oldDate, interval);
		}

		let oldDateCopy = oldDate;

		// Create a new date object (Remember to multiply by 1000 to get milliseconds).
		var tmp = new Date( oldDate * 1000 );
		// Keep a reference on the old month (to check for overflows).
		var oldMonth = tmp.getMonth();
		// Monthly?
		if ( interval === 2 ) {
			// Increment the month by 1 (monthly interval).
			tmp.setMonth( tmp.getMonth() + 1 );
		}
		// Bimonthly?
		else if ( interval === 3 ) {
			// Increment the month by 2 (bimonthly interval).
			tmp.setMonth( tmp.getMonth() + 2 );
		}
		// Quarterly
		else if ( interval === 4 ) {
			// Increment the month by 3 (quarterly interval).
			tmp.setMonth( tmp.getMonth() + 3 );
		}
		// Biannual?
		else if ( interval === 5 ) {
			// Increment the month by 6 (biannual interval).
			tmp.setMonth( tmp.getMonth() + 6 );
		}
		// Annual?
		else if ( interval === 6 ) {
			// Increment the month by 12 (annual interval).
			tmp.setMonth( tmp.getMonth() + 12 );
		}
		// Make sure that we keep the correct day, in case no overflow happened.
		if ( oldMonth + 1 === tmp.getMonth() ) {
			tmp.setDate( new Date( startDate * 1000 ).getDate() );
		}
		// Check, if an overflow emerges.
		if ( (oldMonth + 1) % 12 !== tmp.getMonth() % 12 ) {
			// Setting the day to zero will give us the last day of the previous month.
			var newDate = new Date( tmp.getFullYear(), tmp.getMonth(), 0 );
			// Remember to divide by 1000 because we want to get seconds.
			return Math.floor( newDate.getTime() / 1000 );
		}
		// No overflow?
		else {
			// Remember to divide by 1000 because we want to get seconds.
			return Math.floor( tmp.getTime() / 1000 );
		}
		
	}

	/**
	 * Increments a given date according to a given interval.
	 * 
	 * @param {number} oldDate The date to increment as a timestamp in seconds.
	 * @param {number} interval The interval: Can be either 0 for one week or 1 for four weeks.
	 * @return {number} The new data as a timestamp in seconds.
	 */
	static stepIntervalDays(oldDate, interval) {
		if (interval !== 0 && interval !== 1) {
			throw new Error(`Invalid interval! Given ${interval} but expected 0 or 1.`);
		}

		let weekInSeconds = 7 * 24 * 60 * 60;
		let fourWeeksInSeconds = 4 * weekInSeconds;
		
		return oldDate + (interval === 0 ? weekInSeconds : fourWeeksInSeconds);
	}

	static stepIntervalMonths() {}
}