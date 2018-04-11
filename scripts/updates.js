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
        // Get recurring transactions to iterate over them.
        var recurringTransactions = readMainStorage( "recurring" );
        // Iterate over all recurring transactions to check if we need to execute a transaction.
        for ( var i = 0; i < recurringTransactions.length; i++ ) {
            // Date less/equal today?
            // We want to use "while" instead of "if", here is an example why:
            // Transaction should occur on 01.01.2020 and has a monthly interval. The user does not
            // log in until 03.04.2020. Now the transaction needs to be executed multiple times, not just once.
            while ( recurringTransactions[i].nextDate <= getCurrentDate() ) {
                // Execute the correct transaction.
                // Earning? => addEarning(...)
                if ( recurringTransactions[i].type === "earning" ) {
                    addEarning( recurringTransactions[i].name, recurringTransactions[i].amount, recurringTransactions[i].budget, recurringTransactions[i].category, recurringTransactions[i].nextDate, recurringTransactions[i].allocationOn );
                }
                // Spending? => addSpending(...)
                else if ( recurringTransactions[i].type === "spending" ) {
                    addSpending( recurringTransactions[i].name, recurringTransactions[i].amount, recurringTransactions[i].budget, recurringTransactions[i].category, recurringTransactions[i].nextDate );
                }
                // Update the recurring transaction entry.
                recurringTransactions[i].nextDate = getNewDate( recurringTransactions[i].startDate, recurringTransactions[i].nextDate, recurringTransactions[i].interval );
                // When we are done with updating, we write the new data back to mainStorage.json (only the date changed).
                writeMainStorage( "recurring", recurringTransactions );
            }
        }
        // Set update to true, because we are done with updating for this session.
        // (The variable will be set to false every time the application restarts)
        writeMainStorage( "update", true );
    }
}
