/**
 * This file is for updates. Every time the application is started, the functions in here
 * will be exectuted first to check for updates (and to keep transactions up to date)
 *
 * @module updates
 * @author Malte311
 */

const electron = require( 'electron' );
const request = require( 'request' );
const compareVersions = require( 'compare-versions' );

const repoURL = "https://api.github.com/repos/Malte311/FinanceList-Desktop/contents/package.json";
const latestRelease = "https://github.com/malte311/FinanceList-Desktop/releases/latest";
var hasUpdate = false;

/**
 * Updates the application (searches for newer versions and executes recurring transactions).
 */
function updateApplication() {
    // Only do something if no update was done yet.
    // If updates have already been executed, do nothing.
    if ( !readMainStorage( "update" ) ) {
        executeRecurringTransactions();
        checkForUpdates();
        // Set update to true, because we are done with updating for this session.
        // (The variable will be set to false every time the application restarts)
        writeMainStorage( "update", true );
    }
}

/**
 * Executes recurring transactions, if they are due.
 * This function will be called every time the index page is loaded. It checks if
 * updates were already made and if so, it does nothing.
 */
function executeRecurringTransactions() {
    // Get recurring transactions to iterate over them.
    var recurringTransactions = readMainStorage( "recurring" );
    // Iterate over all recurring transactions to check if we need to execute a transaction.
    for ( var i = 0; i < recurringTransactions.length; i++ ) {
        // Date less/equal today?
        // We want to use "while" instead of "if", here is an example why:
        // Transaction should occur on 01.01.2020 and has a monthly interval.
        // The user does not log in until 03.04.2020.
        // Now the transaction needs to be executed multiple times, not just once.
        while ( recurringTransactions[i].nextDate <= getCurrentDate() ) {
            // End date not existing or not reached yet?
            if ( recurringTransactions[i].endDate < 0
                    || (recurringTransactions[i].endDate > 0
                        && recurringTransactions[i].nextDate <= recurringTransactions[i].endDate) ) {
                // Execute the correct transaction.
                // Earning? => addEarning(...)
                if ( recurringTransactions[i].type === "earning" ) {
                    addEarning( recurringTransactions[i].name, recurringTransactions[i].amount,
                                recurringTransactions[i].budget, recurringTransactions[i].category,
                                recurringTransactions[i].nextDate, recurringTransactions[i].allocationOn );
                }
                // Spending? => addSpending(...)
                else if ( recurringTransactions[i].type === "spending" ) {
                    addSpending( recurringTransactions[i].name, recurringTransactions[i].amount,
                                 recurringTransactions[i].budget, recurringTransactions[i].category,
                                 recurringTransactions[i].nextDate );
                }
                // Update the recurring transaction entry.
                recurringTransactions[i].nextDate = getNewDate( recurringTransactions[i].startDate,
                                                                recurringTransactions[i].nextDate,
                                                                recurringTransactions[i].interval );
                // When we are done with updating, we write the new data back
                // to mainStorage.json (only the date changed).
                writeMainStorage( "recurring", recurringTransactions );
            }
            // End date reached?
            else {
                // Delete the recurring transaction.
                deleteRecurringTransaction( recurringTransactions[i].name );
            }
        }
        // End date exists and got reached?
        if ( recurringTransactions[i].endDate > 0
                && recurringTransactions[i].nextDate > recurringTransactions[i].endDate ) {
            // Delete the recurring transaction.
            deleteRecurringTransaction( recurringTransactions[i].name );
        }
    }
}

/**
 * Checks for updates. If an update is available, the user gets a notification.
 */
function checkForUpdates() {
    var options = {
        url: repoURL,
        headers: {
            "User-Agent": "FinanceList-Desktop by Malte311"
		}
    };

    // Compare current version to the latest version on GitHub
    function response( e, resp, body ) {
        if ( !e && resp.statusCode == 200 ) {
            body = JSON.parse( body );

            var package_json = new Buffer( body.content, 'base64' ).toString( 'ascii' );
            package_json = JSON.parse( package_json );

            hasUpdate = compareVersions( remote.app.getVersion(), package_json.version ) < 0;

            showUpdateNotification();
        }
    }
    request( options, response );
}

/**
 * Shows a notification in case a new version of this application is available.
 */
function showUpdateNotification() {
    if ( hasUpdate ) {
        var textdata = require( "./text/updates_" + getLanguage() + ".json.js" );
        dialog.showMessageBox({
            type: "info",
            title: textdata["updateAvailable"],
            message: textdata["updateMessage"],
            buttons: [textdata["download"], textdata["later"]],
            cancelId: 1
        }, function ( num ) {
            if ( num == 0 ) {
                electron.shell.openExternal( latestRelease );
            }
        });
    }
}
