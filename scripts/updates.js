/**************************************************************************************************
 * This file is for updates. Every time, the application is started, the functions in here
 * will be exectuted first to check for updates.
**************************************************************************************************/

/**
 * This function executes recurring transactions, if they are due.
 * This function will be called every time the index page is loaded. It checks if
 * updates were already made and if so, it does nothing.
 */
function executeRecurringTransactions() {
    // Only do something if no update was done yet.
    // If updates have already been executed, do nothing.
    if ( !readMainStorage( "update" ) ) {
        // Save the current date (we need this reversed to compare, otherwise
        // a comparison won't give us the correct result).
        var currentDateReverse = getCurrentDate().split( "." )[2] + "." + getCurrentDate().split( "." )[1] + "." + getCurrentDate().split( "." )[0];
        // Get recurring transactions to iterate over them.
        var recurringTransactions = readMainStorage( "recurring" );
        // Iterate over all recurring transactions to check if we need to execute a transaction.
        for ( var i = 0; i < recurringTransactions.length; i++ ) {
            var transactionDateReverse = recurringTransactions[i].date.split( "." )[2] + "." + recurringTransactions[i].date.split( "." )[1] + "." + recurringTransactions[i].date.split( "." )[0];
            // Date less/equal today?
            // We want to use "while" instead of "if", here is an example why:
            // Transaction should occur on 01.01.2020 and has a monthly interval. The user does not
            // log in until 03.04.2020. Now the transaction needs to be executed multiple times, not just once.
            while ( transactionDateReverse <= currentDateReverse ) {
                // Execute the correct transaction.
                // Earning? => addEarning(...)
                if ( recurringTransactions[i].type === "earning" ) {
                    addEarning( recurringTransactions[i].name, recurringTransactions[i].amount, recurringTransactions[i].budget, recurringTransactions[i].category, recurringTransactions[i].date, recurringTransactions[i].allocationOn );
                }
                // Spending? => addSpending(...)
                else if ( recurringTransactions[i].type === "spending" ) {
                    addSpending( recurringTransactions[i].name, recurringTransactions[i].amount, recurringTransactions[i].budget, recurringTransactions[i].category, recurringTransactions[i].date );
                }
                // Update the recurring transaction entry.
                // Determine the new date.
                var newMonth = parseInt( recurringTransactions[i].date.split( "." )[1] ) + recurringTransactions[i].interval;
                var newYear = parseInt( recurringTransactions[i].date.split( "." )[2] );
                // Check if there was an overflow and handle it.
                // Note: We are already in a while loop, so we use "if" instead of "while" here.
                if ( newMonth > 12 ) {
                    // Subtract the number of months and update the year.
                    newMonth = newMonth - 12;
                    newYear++;
                }
                // Save the new date.
                var date = recurringTransactions[i].date.split( "." )[0] + "." + (newMonth < 10 ? "0" + newMonth.toString() : newMonth.toString()) + "." + newYear.toString();
                recurringTransactions[i].date = date;
                // When we are done with updating, we write the new data back to mainStorage.json (only the date changed).
                writeMainStorage( "recurring", recurringTransactions );
                // Update this variable to the new date (reversed) to check if we need to continue the while loop.
                transactionDateReverse = recurringTransactions[i].date.split( "." )[2] + "." + recurringTransactions[i].date.split( "." )[1] + "." + recurringTransactions[i].date.split( "." )[0];
            }
        }
        // Set update to true, because we are done with updating for this session.
        // (The variable will be set to false every time the application restarts)
        writeMainStorage( "update", true );
    }
}
