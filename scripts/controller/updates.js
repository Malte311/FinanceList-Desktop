// Module to update transactions when app is started.
module.exports.updateTransactions = () => executeRecurringTransactions();

/**
 * This function executes recurring transactions.
 */
function executeRecurringTransactions() {
    // Save the current date (we need this to compare).
    var currentDay = parseInt( getCurrentDate().split( "." )[0] );
    var currentMonth = parseInt( getCurrentDate().split( "." )[1] );
    var currentYear = parseInt( getCurrentDate().split( "." )[2] );
    // Get recurring transactions.
    var recurringTransactions = readMainStorage( "recurring" );
    // Iterate over all of them to check if we need to execute a transaction.
    for ( var i = 0; i < recurringTransactions.length; i++ ) {
        // Date less/equal today?
        if ( parseInt( recurringTransactions[i].date.split( "." )[2] ) <= currentYear &&
             parseInt( recurringTransactions[i].date.split( "." )[1] ) <= currentMonth &&
             parseInt( recurringTransactions[i].date.split( "." )[0] ) <= currentDay ) {
            // TODO: Execute

            // TODO: Update
            // Determine the new date.
            var newMonth = parseInt( getCurrentDate().split( "." )[1] ) + interval;
            var newYear = parseInt( getCurrentDate().split( "." )[2] );
            // Check if there was an overflow and handle it. (we use while instead of if in case the overflow is over more than one year)
            while ( newMonth > 12 ) {
                // Subtract the number of months and update the year.
                newMonth = newMonth - 12;
                newYear++;
            }
            var date = getCurrentDate().split( "." )[0] + "." + (newMonth < 10 ? "0" + newMonth.toString() : newMonth.toString()) + "." + newYear.toString();

        }
    }
}
