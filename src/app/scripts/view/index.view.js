/**
 * This file is responsible for the view on the overview page.
 *
 * @module indexView
 * @author Malte311
 */

var textElements;

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