// This indicates how many recent spendings should be shown.
const numberOfRecentSpendings = 5;

/**
 * This function displays five of the recent spendings, if they exist.
 */
function displayRecentSpendings() {
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
    // Declare a quest to search for spendings.
    var quest = { connector:'or', params:[['type', 'spending']] };
    // Declare a variable to store the spending data in.
    var spendingData = [];
    // Search for the recent spendings (they may be in older files, thats why we iterate).
    // Remember that we need to reverse the names again (undo the reverse).
    for ( var i = 0; i < JSONFiles.length; i++ ) {
        // Reverse again to undo the reverse.
        var tmp = JSONFiles[i].split( "." );
        JSONFiles[i] = tmp[1] + "." + tmp[0] + ".json";
        // This appends the data to the existing array (we want to append at the beginning
        // because the most recent data is at the end).
        spendingData = getData( JSONFiles[i], quest ).concat( spendingData );
        // Found enough data? Stop looping and go on.
        if ( spendingData.length >= numberOfRecentSpendings ) break;
    }
    // Make sure that some data exists.
    if ( spendingData.length > 0 ) {
        // We will append the HTML content to this string.
        var recentSpendingsTable = "<table class=\"w3-table-all w3-striped w3-white\">";
        // Now, we just need to display the data. Remember that new data is at the end, so
        // we need to loop backwards.
        for ( var i = spendingData.length - 1; i >= 0; i-- ) {
            recentSpendingsTable += "<tr><td><i class=\"far fa-money-bill-alt w3-text-green w3-large\"></i> " + spendingData[i].name + " </td>" +
                                    "<td><i>" + spendingData[i].amount + getCurrencySign() + "</i></td>" +
                                    "<td><i>" + spendingData[i].date + "</i></td></tr>";
            // Display only numberOfRecentSpendings many items.
            if ( spendingData.length - numberOfRecentSpendings === i ) break;
        }
        $( "#recentSpendings" ).html( "<h3><i class=\"fa fa-arrow-right w3-text-green w3-large\"></i> " + getRecentSpendingsHeading() + " </h3>" + recentSpendingsTable + "</table>" );
    }
}

/**
 * This function displays the current balance for each budget.
 */
function displayBudgetOverview() {

    // <p></p>
    // <div class="w3-grey">
    //     <div class="w3-container w3-center w3-padding w3-green" style="width:25%">+25%</div>
    // </div>
    //
    // <p></p>
    // <div class="w3-grey">
    //     <div class="w3-container w3-center w3-padding w3-orange" style="width:50%">50%</div>
    // </div>
    //
    // <p></p>
    // <div class="w3-grey">
    //     <div class="w3-container w3-center w3-padding w3-red" style="width:75%">75%</div>
    // </div>
}

/**
 * This function updates the view when changes are made.
 */
function updateView() {
    // Display a table of recent spendings.
    displayRecentSpendings();
    // Display current balances.
    displayBudgetOverview();
}
