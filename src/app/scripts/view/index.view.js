/**
 * This file is responsible for the view on the overview page.
 *
 * @module indexView
 * @author Malte311
 */

var textElements;

/**
 * This function displays the recent spendings and earnings, if they exist.
 * @param {String} type The type of transactions we want to display (earning/spending)
 */
function displayRecentTransactions( type ) {
    // Get recent data.
    var data = getRecentTransactions( type );
    // Make sure that some data exists.
    if ( data.length > 0 ) {
        // Get the correct limit, in case the limits are different.
        var limit = (type === "earning" ? numberOfRecentEarnings : numberOfRecentSpendings);
        // We will append the HTML content to this string.
        var recentTransactionsTable = "<table class=\"w3-table-all w3-striped w3-white\">";
		
		let DateHandler = require('../scripts/utils/dateHandler.js');
		// Now, we just need to display the data. Remember that new data is at the end, so
        // we need to loop backwards.
        for ( var i = data.length - 1; i >= 0; i-- ) {
            var amount = data[i].amount.toFixed(2);
            recentTransactionsTable += "<tr><td><i class=\"far fa-money-bill-alt w3-text-green w3-large\"></i>" +
                                       " " + data[i].name + " </td>" +
                                       "<td><i>" + amount + getCurrencySign() + "</i></td>" +
                                       "<td><i>" + DateHandler.timestampToString( data[i].date ) + "</i></td></tr>";
            // Display only limit many items (defined in index.controller.js).
            if ( data.length - limit === i ) break;
        }
        // Display the table with recent transactions.
        $( "#" + type + "Recent" ).html(
            "<h3><i class=\"fa fa-arrow-right w3-text-green w3-large\"></i> " +
            (type == "spending" ?
            textElements.recentSpendings :
            textElements.recentEarnings) +
            " </h3>" +
            recentTransactionsTable + "</table>"
        );
    }
    // Display a message that no data exists yet.
    else {
        $( "#" + type + "Recent" ).html(
            "<h3><i class=\"fa fa-arrow-right w3-text-green w3-large\"></i> " +
            (type == "spending" ?
            textElements.recentSpendings :
            textElements.recentEarnings) +
            " </h3><i>" +
            (type == "spending" ?
            textElements.noRecentSpendings :
            textElements.noRecentEarnings) +
            "</i>"
        );
    }
}

/**
 * This function displays a chart which visualizes all time transactions.
 * @param {String} type The type of transactions we want to visualize (earning/spending)
 */
function displayChart( type ) {
    // Reset the canvas in case no data existed before (then the HTML content was overwritten).
    $( "#" + type + "ChartDiv" ).html(
        "<canvas id=\"" + type + "\" width=\"8000\" height=\"2500\"></canvas>" );
    // Get a reference to the canvas in which the chart should be.
    var transactionChart = $( "#" + type )[0];
    // Get all budgets.
    var allTimeTransactions = (type === "earning" ?
                              readMainStorage( "allTimeEarnings" ) :
                              readMainStorage( "allTimeSpendings" ));
    // Declare some variables to store the values in them.
    var labels = [], dataset = [];
    // We will declare a variable to make sure there is at least one earning/spending.
    // In addition to that, this will contain the sum of all spendings/earnings.
    var checksum = 0;
    // Iterate over them to get the all time spendings.
    for ( var i = 0; i < allTimeTransactions.length; i++ ) {
        // Get the name of every budget.
        labels.push( allTimeTransactions[i][0] );
        // Get the balance of every budget
        dataset.push(allTimeTransactions[i][1].toFixed(2));
        // Add the amount to sum up all transactions.
        checksum = (Math.round( (checksum + allTimeTransactions[i][1]) * 1e2 ) / 1e2);
    }
    // Now check if there exists at least one earning/spending.
    if ( checksum > 0 ) {
        checksum = checksum.toFixed(2);
        // Create the chart. The colors are declared as a constant in controller.js.
        createChart( transactionChart, labels, dataset, colors, colors,
                     readPreference( "chartType" ) );
        // Display the sum of all time earnings/spendings.
        $( "#" + type + "ChartDiv" ).append(
            "<br><center>" +
            (type == "spending" ?
            textElements.allTimeSpendings :
            textElements.allTimeEarnings) + ": " +
            checksum + getCurrencySign() + "</center>"
        );
    }
    // Otherwise display a message that there is no data yet.
    else {
        $( "#" + type + "ChartDiv" ).html(
            "<i>" + (type == "spending" ?
                    textElements.noSpendings :
                    textElements.noEarnings) +
            "</i>"
        );
    }
}