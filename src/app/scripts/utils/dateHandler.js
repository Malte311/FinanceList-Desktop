/**
 * Class for dealing with times and dates.
 */
module.exports = class DateHandler {
	constructor() {

	}

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
	 */
	timestampToString(ts) {
		let date = new Date(ts * 1000); // Multiply by 1000 to get milliseconds from seconds.
		
		let day = date.getDate().toString().padStart(2, '0');
		let month = (date.getMonth() + 1).toString().padStart(2, '0'); // Month is zero indexed
		let year = date.getFullYear().toString();
		
		return `${day}.${month}.${year}`;
	}

	/**
	 * Makes sure that a given timestamp is not already used. If it is, we add one second to it.
	 * @param {number} date The date as a timestamp.
	 * @return {number} A unique timestamp for the date.
	 */
	// uniqueDate( date ) {
	// 	var dateInStringFormat = dateToString( date );
	// 	var correspondingFile  = readPreference( "path" ) + path.sep
	// 						+ dateInStringFormat.split( "." )[1] + "."
	// 						+ dateInStringFormat.split( "." )[2] + ".json";
	// 	var content = readJSONFile( correspondingFile );

	// 	// one for-loop is enough because the file is sorted by date. So if we add one, we can detect
	// 	// duplicates again.
	// 	for ( var i = 0; i < content.length; i++ ) {
	// 		if ( content[i].date === date ) {
	// 			date = date + 1;
	// 		}
	// 	}
	// 	return date;
	// }
}