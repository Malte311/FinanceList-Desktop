/**************************************************************************************************
 * This file controls all actions on the overview page.
**************************************************************************************************/

// This indicates how many recent spendings should be shown.
const numberOfRecentSpendings = 5;
// Same for recent earnings
const numberOfRecentEarnings = numberOfRecentSpendings;

/**
 * This function initializes the page when its loaded. This means it sets the
 * language and the dynamic content.
 */
function loadPage() {
    // We will always set the language first.
    setLanguage( readPreference( "language" ) );
    // Display all the other content.
    updateView();
}

/**
 * This function returns recent data
 * @param {String} type The type of transactions we want to get (earning/spending)
 * @return {JSON[]} An array containing the data.
 */
function getRecentTransactions( type ) {
    // Get the correct limit, in case the limits are different.
    var limit = (type === "earning" ? numberOfRecentEarnings : numberOfRecentSpendings);
    // Get all .json files which contain data (mainStorage is excluded in getJSONFiles).
    var JSONFiles = getJSONFiles();
    // Before searching, we need to sort the files so we can start searching in the newest file.
    for ( var i = 0; i < JSONFiles.length; i++ ) {
        // In order to search the files, we reverse the filenames (e.g. "01.2018" => "2018.01").
        // To do this, we make sure the filenames are in the correct format.
        // This regular expression makes sure that there are two digits followed by a dot and
        // another four digits. Nothing else is allowed.
        if ( /^(\d\d[.]\d\d\d\d)$()/.test( JSONFiles[i] ) ) {
            // Filename ok? Reverse it.
            var tmp = JSONFiles[i].split( "." );
            JSONFiles[i] = tmp[1] + "." + tmp[0];
        }
        // Filename invalid? Remove it from array.
        else {
            JSONFiles.splice( i, 1 );
        }
    }
    // Now we can sort the files.
    JSONFiles = JSONFiles.sort();
    // Declare a quest to search for the correct type of data.
    var quest = { connector:'or', params:[['type', type]] };
    // Declare a variable to store the data in.
    var data = [];
    // Search for the most recent data (they may be in older files, thats why we iterate).
    // Remember that we need to reverse the names again (undo the reverse).
    // Also, we loop backwards, because we want to begin with the newest file.
    for ( var i = JSONFiles.length - 1; i >= 0; i-- ) {
        // Reverse again to undo the reverse.
        var tmp = JSONFiles[i].split( "." );
        JSONFiles[i] = tmp[1] + "." + tmp[0] + ".json";
        // This appends the data to the existing array (we want to append at the beginning
        // because the most recent data is at the end).
        data = getData( JSONFiles[i], quest ).concat( data );
        // Found enough data? Stop looping. Otherwise we search in the next file.
        if ( data.length >= limit ) break;
    }
    // Return the array with data.
    return data;
}
