/**************************************************************************************************
 * This file is responsible for the view on the overview page.
**************************************************************************************************/

var textfile;

/**
 * This function displays the current surplus for each budget. This means,
 * it will display the difference between all earnings from the current month
 * and all spendings from the current month.
 */
function displayBalances() {
    // Reset previous content.
    $( "#currentBalances" ).html( "" );
    // Get all budgets to iterate over them.
    var currentBudgets = readMainStorage( "budgets" );
    // Display the monthly surplus for every budget.
    for ( var i = 0; i < currentBudgets.length; i++ ) {
        // Set the name of the budget as a heading.
        $( "#currentBalances" ).append( "<h5><i class=\"fas fa-angle-double-right w3-text-deep-purple\"></i>" + " " + currentBudgets[i][0] + " </h5>" );
        // Find out the sum of earnings and spendings in this month, so we can calculate the surplus.
        var quest = { connector:'or', params:[['budget', currentBudgets[i][0]]] };
        var dataObj = getData( getCurrentFileName(), quest );
        // Add all earnings and spendings from this month.
        var totalEarningsThisMonth = 0, totalSpendingsThisMonth = 0;
        // Make sure, that data exists. Otherwise we will stay at a surplus of zero.
        if ( dataObj !== undefined ) {
            // Now, add up all the amounts for earnings and spendings each.
            for ( var j = 0; j < dataObj.length; j++ ) {
                // Earning? Increase totalEarningsThisMonth.
                if ( dataObj[j].type === "earning" ) {
                    totalEarningsThisMonth = Math.round( (totalEarningsThisMonth + dataObj[j].amount) * 1e2 ) / 1e2;
                }
                // Spending? Increase totalSpendingsThisMonth.
                else if ( dataObj[j].type === "spending" ) {
                    totalSpendingsThisMonth = Math.round( (totalSpendingsThisMonth + dataObj[j].amount) * 1e2 ) / 1e2;
                }
            }
        }
        // Now, find out if the difference between earnings and spendings is
        // either positive, negative or neutral (zero).
        var percentage = 100;
        var color;
        // Positive balance for this month:
        if ( totalEarningsThisMonth - totalSpendingsThisMonth > 0 ) {
            // Calculate the ratio of how much money is left from this months earnings and use the color green.
            if ( totalEarningsThisMonth > 0 && totalSpendingsThisMonth !== 0 ) percentage = ((totalEarningsThisMonth - totalSpendingsThisMonth) / totalEarningsThisMonth) * 100;
            color = "green";
        }
        // Balance negative: Red color, percentage still at 100 (so the complete bar is red).
        else if ( totalEarningsThisMonth - totalSpendingsThisMonth < 0 ) {
            color = "red";
        }
        // Balance is exactly zero for this month: Gray color and percentage still at 100:
        else {
            color = "gray";
        }
        // We want to display $2.50 instead of $2.50000000002 (this may happen since we use floating point numbers),
        // so we round the balance.
        var balance = (Math.round( (totalEarningsThisMonth - totalSpendingsThisMonth) * 1e2 ) / 1e2).toString();
        // We want to display every balance with two decimal places (if there is a comma). Example: Display $2.50 instead of $2.5
        // Does a comma exist?
        if ( (totalEarningsThisMonth - totalSpendingsThisMonth).toString().indexOf( "." ) !== -1 ) {
            // If so, we check if there are already two decimal digits. If not, we add a zero.
            if ( (totalEarningsThisMonth - totalSpendingsThisMonth).toString().split( "." )[1].length < 2 ) balance += "0";
        }
        // Now we are ready to display a progress bar which contains the difference.
        $( "#currentBalances" ).append( "<p></p><div class=\"w3-grey\"><div class=\"w3-container w3-center w3-padding w3-" + color + "\" style=\"width:" + percentage + "%;\">" + balance + getCurrencySign() + "</div></div>" );
    }
}

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
        // Now, we just need to display the data. Remember that new data is at the end, so
        // we need to loop backwards.
        for ( var i = data.length - 1; i >= 0; i-- ) {
            // Sometimes we want to add a single zero ($2.5 => $2.50) for a more beautiful display style.
            var amount = data[i].amount;
            // Amount has a comma?
            if ( data[i].amount.toString().indexOf( "." ) !== -1 ) {
                // If there are less than two decimal digits, add a zero at the end.
                if ( data[i].amount.toString().split( "." )[1].length < 2 ) amount += "0";
            }
            recentTransactionsTable += "<tr><td><i class=\"far fa-money-bill-alt w3-text-green w3-large\"></i>" + " " + data[i].name + " </td>" +
                                       "<td><i>" + amount + getCurrencySign() + "</i></td>" +
                                       "<td><i>" + dateToString( data[i].date ) + "</i></td></tr>";
            // Display only limit many items (defined in index.controller.js).
            if ( data.length - limit === i ) break;
        }
        // Display the table with recent transactions.
        $( "#" + type + "Recent" ).html( "<h3><i class=\"fa fa-arrow-right w3-text-green w3-large\"></i> " + getRecentTransactionsHeading( type ) + " </h3>" + recentTransactionsTable + "</table>" );
    }
    // Display a message that no data exists yet.
    else {
        $( "#" + type + "Recent" ).html( "<h3><i class=\"fa fa-arrow-right w3-text-green w3-large\"></i> " + getRecentTransactionsHeading( type ) + " </h3><i>" + getRecentTransactionsMissingDataMessage( type ) + "</i>" );
    }
}

/**
 * This function displays a chart which visualizes all time transactions.
 * @param {String} type The type of transactions we want to visualize (earning/spending)
 */
function displayChart( type ) {
    // Reset the canvas in case no data existed before (then the HTML content was overwritten).
    $( "#" + type + "ChartDiv" ).html( "<canvas id=\"" + type + "\" width=\"8000\" height=\"2500\"></canvas>" );
    // Get a reference to the canvas in which the chart should be.
    var transactionChart = $( "#" + type )[0];
    // Get all budgets.
    var allTimeTransactions = (type === "earning" ? readMainStorage( "allTimeEarnings" ) : readMainStorage( "allTimeSpendings" ));
    // Declare some variables to store the values in them.
    var labels = [], dataset = [];
    // We will declare a variable to make sure there is at least one earning/spending.
    // In addition to that, this will contain the sum of all spendings/earnings.
    var checksum = 0;
    // Iterate over them to get the all time spendings.
    for ( var i = 0; i < allTimeTransactions.length; i++ ) {
        // Get the name of every budget.
        labels.push( allTimeTransactions[i][0] );
        // Get the balance of
        dataset.push( allTimeTransactions[i][1] );
        // Add the amount to sum up all transactions.
        checksum = (Math.round( (checksum + allTimeTransactions[i][1]) * 1e2 ) / 1e2)
    }
    // Now check if there exists at least one earning/spending.
    if ( checksum > 0 ) {
        // Create the chart. The colors are declared as a constant in controller.js.
        createChart( transactionChart, labels, dataset, colors, colors, readPreference( "chartType" ) );
        // Display the amount correctly.
        if ( checksum.toString().indexOf( "." ) !== -1 ) {
            if ( checksum.toString().split( "." )[1].length < 2 ) checksum += "0";
        }
        // Display the sum of all time earnings/spendings.
        $( "#" + type + "ChartDiv" ).append( "<br><center>" + getAllTimeTransactionsText( type ) + ": " + checksum + getCurrencySign() + "</center>" );
    }
    // Otherwise display a message that there is no data yet.
    else {
        $( "#" + type + "ChartDiv" ).html( "<i>" + getAllTimeTransactionsMissingDataMessage( type ) + "</i>" );
    }
}

/**
 * This function updates the view anytime changes are made.
 */
function updateView() {
    textfile = "./text/index_" + getLanguage() + ".json.js";
    // Display current balances.
    displayBalances();
    // Display a table of recent spendings.
    displayRecentTransactions( "spending" );
    // Display all time spendings.
    displayChart( "spending" );
    // Display a table of recent earnings.
    displayRecentTransactions( "earning" );
    // Display all time earnings.
    displayChart( "earning" );
}
