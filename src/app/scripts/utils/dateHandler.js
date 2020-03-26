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
	 * @return {number} A unique timestamp generated from the original timestamp.
	 */
	static createUniqueTimestamp(ts) {		
		let relatedFile = readPreference('path') + require('path').sep + timestampToFilename(ts);
		
		// A single for-loop is sufficient because the file is sorted by date.
		// So if we add one, we can detect new duplicates in the following iterations
		// (and add one again until no duplicates are left).
		let content = readJSONFile(relatedFile);
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
		return dateToFilename(timestampToString(ts));
	}
}