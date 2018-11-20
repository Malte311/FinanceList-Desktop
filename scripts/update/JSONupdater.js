/**
 * This file is used once after updating from version 0.9.1 to version 1.0.0.
 * It simply makes sure, that all timestamps are unique (because this functionality was
 * missing in version 0.9.1).
 *
 * @author Malte311
 */

const config = require( './scripts/config.js' );

/**
 * Loops through all available data and makes sure that every timestamp is unique.
 * Of course, partitioned entries keep the same timestamp.
 */
function createUniqueTimestamps() {
    var allFiles = getJSONFiles();
    var usedDates = [];
    var log = "";

    allFiles.forEach( function( file ) {
        if ( file != "mainStorage" ) {
            log += "Currently updating file " + file + "\r\n\r\n";
            var data = readJSONFile( readPreference( "path" ) + path.sep + file + ".json" );
            data = sortData( data ); // before this version the data was not sorted perfectly
            for ( var i = 0; i < data.length; i++ ) {
                log += "Before: " + JSON.stringify( data[i] ) + "\r\n";
                for ( var j = 0; j < usedDates.length; j++ ) {
                    if ( data[i].date === usedDates[j].date && differentEntries(data[i], usedDates[j]) ) {
                        data[i].date = data[i].date + 1;
                    }
                }
                usedDates.push( data[i] );
                log += "After:  " + JSON.stringify( data[i] ) + "\r\n\r\n";
            }
            // Write back
            replaceData( file + ".json", data );
        }
    });
    log += "Finished!\r\n";
    log += "=====================================================================\r\n\r\n";

    if ( config.log ) {
        fs.appendFileSync( storage.getDefaultDataPath() + path.sep + "log.txt", log );
    }
}

/**
 * Returns if two entries are partitioned or different.
 * @param {JSON} e1 First entry
 * @param {JSON} e2 Second entry
 * @return {bool} True if the entries are different, false if they are partitioned
 */
function differentEntries( e1, e2 ) {
    return e1.date != e2.date ||
           e1.name != e2.name ||
           e1.type != e2.type ||
           e1.category != e2.category ||
           (e1.date == e2.date &&
           e1.budget == e2.budget);
}

var currentVersion = remote.app.getVersion();
var lastUpdate = readPreference( "versionUpdate" );
// Function call only once
if ( (lastUpdate === undefined || currentVersion > lastUpdate) && config.updateNeeded ) {
    createUniqueTimestamps();
    storePreference( "versionUpdate", currentVersion );
}
