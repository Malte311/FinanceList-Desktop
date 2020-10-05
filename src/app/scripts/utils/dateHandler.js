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
	 * Creates a timestamp out of a given day, month and year.
	 * 
	 * @param {string} day The day of the date.
	 * @param {string} month The month of the date.
	 * @param {string} year The year of the date.
	 * @return {number} The corresponding timestamp for the given date.
	 */
	static dateToTimestamp(day, month, year) {
		return (new Date(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`)).getTime() / 1000;
	}

	/**
	 * Increments a given date by a given interval.
	 * 
	 * @param {number} startDate The original date where the transaction started.
	 * Necessary to keep the original day.
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
	static stepInterval(startDate, oldDate, interval) {
		if (interval === 0 || interval === 1) {
			return DateHandler.stepIntervalDays(oldDate, interval);
		} else if (interval >= 2 && interval <= 6) {
			return DateHandler.stepIntervalMonths(startDate, oldDate, interval);
		} else {
			throw new Error(`Invalid interval! Given ${interval} but must be between 0 and 6.`);
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

	/**
	 * Increments a given date according to a given interval.
	 * 
	 * @param {number} startDate The original date where the transaction started.
	 * Necessary to keep the original day.
	 * @param {number} oldDate The date to increment as a timestamp in seconds.
	 * @param {number} interval The interval: Can be either 2 for one month, 3 for two months,
	 * 4 for three moths, 5 for six months or 6 for one year.
	 * @return {number} The new data as a timestamp in seconds.
	 */
	static stepIntervalMonths(startDate, oldDate, interval) {
		if (interval < 2 || interval > 6) {
			throw new Error(`Invalid interval! Given ${interval} but must be between 2 and 6.`);
		}

		let strDateArr = DateHandler.timestampToString(oldDate).split('.'); // ['dd', 'mm', 'yyyy']
		// Keep the original day (e.g. from 31.03 to 30.04 to 31.05).
		strDateArr[0] = (new Date(startDate * 1000)).getDate().toString().padStart(2, '0');

		switch (interval) {
			case 2: // Increase by one month
				strDateArr[1] = (parseInt(strDateArr[1]) + 1).toString().padStart(2, '0');
				break;
			case 3: // Increase by two months
				strDateArr[1] = (parseInt(strDateArr[1]) + 2).toString().padStart(2, '0');
				break;
			case 4: // Increase by three months
				strDateArr[1] = (parseInt(strDateArr[1]) + 3).toString().padStart(2, '0');
				break;
			case 5: // Increase by six months
				strDateArr[1] = (parseInt(strDateArr[1]) + 6).toString().padStart(2, '0');
				break;
			case 6: // Increase by one year
				strDateArr[2] = (parseInt(strDateArr[2]) + 1).toString().padStart(2, '0');
				break;
		}

		// Enter a new year if month overflowed
		let month = parseInt(strDateArr[1]);
		if (month > 12) {
			strDateArr[1] = (month % 12).toString().padStart(2, '0');
			strDateArr[2] = (parseInt(strDateArr[2]) + parseInt(month / 12)).toString().padStart(2, '0');
		}

		// Set day to the last day of the month if it overflows (e.g. from 31.03 to 31.04).
		if (parseInt(strDateArr[0]) > (new Date(strDateArr[2], strDateArr[1], 0)).getDate()) {
			strDateArr[0] = (new Date(strDateArr[2], strDateArr[1], 0)).getDate().toString().padStart(2, '0');
		}

		return Math.floor((new Date(strDateArr.reverse().join('-'))).getTime() / 1000);
	}
}