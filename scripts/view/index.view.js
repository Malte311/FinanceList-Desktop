// This indicates how many recent spendings should be shown.
const numberOfRecentSpendings = 5;

/**
 * This function displays the current balance for each budget.
 */
function displayBalances() {
    // Reset previous content.
    $( "#currentBalances" ).html( "" );
    // Get all budgets to iterate over them.
    var currentBudgets = readMainStorage( "budgets" );
    // Display the monthly surplus for every budget.
    for ( var i = 0; i < currentBudgets.length; i++ ) {
        // Set the name of the budget.
        $( "#currentBalances" ).append( "<h5><i class=\"fas fa-angle-double-right w3-text-deep-purple\"></i> " + currentBudgets[i][0] + " </h5>" );
        // Find out the sum of earnings in this month, so we can calculate the surplus.
        var quest = { connector:'or', params:[['budget', currentBudgets[i][0]]] };
        var dataObj = getData( getCurrentFileName(), quest );
        // Add all earnings and spendings from this month.
        var totalEarningsThisMonth = 0, totalSpendingsThisMonth = 0;
        for ( var j = 0; j < dataObj.length; j++ ) {
            if ( dataObj[j].type === "earning" ) {
                totalEarningsThisMonth += dataObj[j].amount;
            }
            else if ( dataObj[j].type === "spending" ) {
                totalSpendingsThisMonth += dataObj[j].amount;
            }
        }
        // Calculate the ratio of how much money is left from this months earnings.
        var percentage = 100
        var color;
        // Positive balance for this month:
        if ( totalEarningsThisMonth - totalSpendingsThisMonth > 0 ) {
            if ( totalEarningsThisMonth > 0 && totalSpendingsThisMonth !== 0 ) percentage = (totalSpendingsThisMonth / totalEarningsThisMonth) * 100;
            color = "green";
        }
        // Balance negative: Red color, percentage still at 100 (so the complete bar is red).
        else if ( totalEarningsThisMonth - totalSpendingsThisMonth < 0 ) {
            color = "red";
        }
        // Balance is exactly zero for this month (percentage still at 100):
        else {
            color = "gray";
        }
        // We want to display every balance with two decimal places (if there is a comma). Example: Display $2.50 instead of $2.5
        var balance = totalEarningsThisMonth - totalSpendingsThisMonth;
        if ( (totalEarningsThisMonth - totalSpendingsThisMonth).toString().indexOf( "." ) !== -1 ) {
            if ( (totalEarningsThisMonth - totalSpendingsThisMonth).toString().split( "." )[1].length < 2 ) balance += "0";
        }
        $( "#currentBalances" ).append( "<p></p><div class=\"w3-grey\"><div class=\"w3-container w3-center w3-padding w3-" + color + "\" style=\"width:" + percentage + "%;\">" + balance + getCurrencySign() + "</div></div>" );
    }
}

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
    // Also, we loop backwards, because we want to begin with the newest file.
    for ( var i = JSONFiles.length - 1; i >= 0; i-- ) {
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
            // Sometimes we want to add a single zero (2.5 => 2.50) for a more beautiful display style.
            var amount = spendingData[i].amount;
            if ( spendingData[i].amount.toString().indexOf( "." ) !== -1 ) {
                if ( spendingData[i].amount.toString().split( "." )[1].length < 2 ) amount += "0";
            }
            recentSpendingsTable += "<tr><td><i class=\"far fa-money-bill-alt w3-text-green w3-large\"></i> " + spendingData[i].name + " </td>" +
                                    "<td><i>" + amount + getCurrencySign() + "</i></td>" +
                                    "<td><i>" + spendingData[i].date + "</i></td></tr>";
            // Display only numberOfRecentSpendings many items.
            if ( spendingData.length - numberOfRecentSpendings === i ) break;
        }
        $( "#recentSpendings" ).html( "<h3><i class=\"fa fa-arrow-right w3-text-green w3-large\"></i> " + getRecentSpendingsHeading() + " </h3>" + recentSpendingsTable + "</table>" );
    }
    // Display a message that no data exists yet.
    else {
        $( "#recentSpendings" ).html( "<h3><i class=\"fa fa-arrow-right w3-text-green w3-large\"></i> " + getRecentSpendingsHeading() + " </h3><i>" + getRecentSpendingsMissingDataMessage() + "</i>" );
    }
}

/**
 * This function displays a chart which visualizes all time spendings.
 */
function displaySpendingChart() {
    // Reset the canvas in case no data existed before (then the HTML content was overwritten).
    $( "#spendingChartDiv" ).html( "<canvas id=\"Spendings\" width=\"8000\" height=\"2500\"></canvas>" );
    // Get a reference to the canvas in which the chart should be.
    var spendingChart = $( "#Spendings" )[0];
    // Get all budgets.
    var allTimeSpendings = readMainStorage( "allTimeSpendings" );
    // Declare some variables to store the values in them.
    var labels = [], dataset = [];
    // We will declare a checksum, to make sure there is at least one earning.
    var checksum = 0;
    // Iterate over them to get the all time spendings.
    for ( var i = 0; i < allTimeSpendings.length; i++ ) {
        // Get the name of every budget.
        labels.push( allTimeSpendings[i][0] );
        // Get the balance of
        dataset.push( allTimeSpendings[i][1] );
        // Update the checksum
        checksum += allTimeSpendings[i][1];
    }
    // Now use the checksum to check if there exists at least one earning.
    if ( checksum > 0 ) {
        // Create the chart. The colors are declared as a constant in controller.js.
        createChart( spendingChart, labels, dataset, colors, colors, readPreference( "chartType" ) );
    }
    // Otherwise display a message that there is no data yet.
    else {
        $( "#spendingChartDiv" ).html( "<i>" + getAllTimeSpendingsMissingDataMessage() + "</i>" );
    }
}

/**
 * This function displays a chart which visualizes all time earnings.
 */
function displayEarningChart() {
    // Reset the canvas in case no data existed before (then the HTML content was overwritten).
    $( "#earningChartDiv" ).html( "<canvas id=\"Earnings\" width=\"8000\" height=\"2500\"></canvas>" );
    // Get a reference to the canvas in which the chart should be.
    var earningChart = $( "#Earnings" )[0];
    // Get all budgets.
    var allTimeEarnings = readMainStorage( "allTimeEarnings" );
    // Declare some variables to store the values in them.
    var labels = [], dataset = [];
    // We will declare a checksum, to make sure there is at least one earning.
    var checksum = 0;
    // Iterate over them to get the all time spendings.
    for ( var i = 0; i < allTimeEarnings.length; i++ ) {
        // Get the name of every budget.
        labels.push( allTimeEarnings[i][0] );
        // Get the balance of
        dataset.push( allTimeEarnings[i][1] );
        // Update the checksum
        checksum += allTimeEarnings[i][1];
    }
    // Now use the checksum to check if there exists at least one earning.
    if ( checksum > 0 ) {
        // Create the chart. The colors are declared as a constant in controller.js.
        createChart( earningChart, labels, dataset, colors, colors, readPreference( "chartType" ) );
    }
    // Otherwise display a message that there is no data yet.
    else {
        $( "#earningChartDiv" ).html( "<i>" + getAllTimeEarningsMissingDataMessage() + "</i>" );
    }
}

/**
 * This function updates the view when changes are made.
 */
function updateView() {
    // Display current balances.
    displayBalances();
    // Display a table of recent spendings.
    displayRecentSpendings();
    // Display all time spendings.
    displaySpendingChart();
    // Display all time earnings.
    displayEarningChart();
}
