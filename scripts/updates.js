/**
 * This function executes recurring transactions.
 */
function executeRecurringTransactions() {
    // Only do something if no update was done yet.
    // If updates have already been executed, do nothing.
    if ( !readMainStorage( "update" ) ) {
        // Save the current date (we need this reversed to compare).
        var currentDateReverse = getCurrentDate().split( "." )[2] + "." + getCurrentDate().split( "." )[1] + "." + getCurrentDate().split( "." )[0];
        // Get recurring transactions.
        var recurringTransactions = readMainStorage( "recurring" );
        // Iterate over all of them to check if we need to execute a transaction.
        for ( var i = 0; i < recurringTransactions.length; i++ ) {
            var transactionDateReverse = recurringTransactions[i].date.split( "." )[2] + "." + recurringTransactions[i].date.split( "." )[1] + "." + recurringTransactions[i].date.split( "." )[0];
            // Date less/equal today?
            // We want to use "while" instead of "if", here is an example why:
            // Transaction should occur on 01.01.2020 and has a monthly interval. The user does not
            // log in until 03.04.2020. Now the transaction needs to be executed multiple times, not just once.
            while ( transactionDateReverse <= currentDateReverse ) {
                // Execute the correct transaction.
                // Earning?
                if ( recurringTransactions[i].type === "earning" ) {
                    addEarning( recurringTransactions[i].name, recurringTransactions[i].amount, recurringTransactions[i].budget, recurringTransactions[i].category, recurringTransactions[i].date, recurringTransactions[i].allocationOn );
                }
                // Spending?
                else if ( recurringTransactions[i].type === "spending" ) {
                    addSpending( recurringTransactions[i].name, recurringTransactions[i].amount, recurringTransactions[i].budget, recurringTransactions[i].category, recurringTransactions[i].date );
                }
                // Update the recurring transaction entry.
                // Determine the new date.
                var newMonth = parseInt( recurringTransactions[i].date.split( "." )[1] ) + recurringTransactions[i].interval;
                var newYear = parseInt( recurringTransactions[i].date.split( "." )[2] );
                // Check if there was an overflow and handle it.
                // Note: We are in a while loop, so we use "if" instead of "while" here because
                // we want to execute the transaction multiple times if we missed it.
                if ( newMonth > 12 ) {
                    // Subtract the number of months and update the year.
                    newMonth = newMonth - 12;
                    newYear++;
                }
                var date = recurringTransactions[i].date.split( "." )[0] + "." + (newMonth < 10 ? "0" + newMonth.toString() : newMonth.toString()) + "." + newYear.toString();
                recurringTransactions[i].date = date;
                // When we are done with updating, we write the new data back to mainStorage.json.
                writeMainStorage( "recurring", recurringTransactions );
                // Update this variable to check if we need to continue in the while loop.
                transactionDateReverse = recurringTransactions[i].date.split( "." )[2] + "." + recurringTransactions[i].date.split( "." )[1] + "." + recurringTransactions[i].date.split( "." )[0];
            }
        }
        // Set update to true, because we are done with updating for today.
        writeMainStorage( "update", true );
    }
}
