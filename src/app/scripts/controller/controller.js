/**
 * This file contains controlling functions which need to be accessed from multiple pages.
 *
 * @module controller
 * @author Malte311
 */

// Needed for further modules.
const { remote } = require( 'electron' );
// Module for dialogues (needed when setting the path or to display error messages).
const { dialog } = require( 'electron' ).remote;
// Neccessary to set the window size.
const win = remote.getCurrentWindow();
// This saves available colors for charts.

const maxStrLen = 100;
const maxSWLen = 30;

/**
 * This function saves new spending entries in .json files.
 * @param {String} spending The name of the spending.
 * @param {float} sum The cost of the aquired thing.
 * @param {String} budget The budget from which the sum should be subtracted.
 * @param {String} category The category of the spending.
 * @param {String} date The date for the transaction.
 */
function addSpending( spending, sum, budget, category, date ) {
    // Create a JSON object containing the data.
    var spendingObj = {"date": date, "name": spending, "amount": sum, "budget": budget,
                       "type": "spending", "category": category};
    // Now store the data in the corresponding .json file.
    storeData( spendingObj );
    // Update the reference in the mainStorage.
    var budgets = readMainStorage( "budgets" );
    var allTimeSpendings = readMainStorage( "allTimeSpendings" );
    // Search for the correct budget.
    for ( var i = 0; i < allTimeSpendings.length; i++ ) {
        // Found it? Then update the value.
        // Update all time spendings.
        if ( allTimeSpendings[i][0] === budget ) {
            allTimeSpendings[i][1] = Math.round( (allTimeSpendings[i][1] + sum) * 1e2 ) / 1e2;
        }
        // Update the balance of the budget.
        if ( budgets[i][0] === budget ) {
            budgets[i][1] = Math.round( (budgets[i][1] - sum) * 1e2 ) / 1e2;
        }
    }
    // Write back to storage.
    writeMainStorage( "budgets", budgets );
    writeMainStorage( "allTimeSpendings", allTimeSpendings );
}

/**
 * This function saves new earnings entries in .json files.
 * @param {String} earning The name of the earning.
 * @param {float} sum The amount of the earning.
 * @param {String} budget The budget to which the sum should be added.
 * @param {String} category The category of the earning.
 * @param {String} date The date for the transaction.
 * @param {bool} allocationOn Indicates, if the sum should be spread across multiple budgets.
 */
function addEarning( earning, sum, budget, category, date, allocationOn ) {
    // Split the sum?
    if ( allocationOn ) {
        // Get budgets, allocation and allTimeEarnings, because we have to update them all.
        var budgets = readMainStorage( "budgets" );
        var allocation = readMainStorage( "allocation" );
        var allTimeEarnings = readMainStorage( "allTimeEarnings" );
        // We want to keep track of a rest, because not every sum can be split perfectly.
        var rest = sum;
        for ( var i = 0; i < budgets.length; i++ ) {
            // No need to calculate anything in case allocation is zero percent. This is why
            // We make sure here, that allocation is bigger than zero.
            if ( allocation[i][1] > 0 ) {
                // Split the sum: allocation[i][1]/100 is the percentage value, the other stuff is for rounding.
                var newSum = Math.round( (sum*allocation[i][1]/100) * 1e2) / 1e2;
                rest = Math.round( (rest - newSum) * 1e2 ) / 1e2;
                // Added too much?
                if ( rest < 0 ) {
                    // Subtract the overflow from the newSum (we add rest because rest is negative).
                    newSum = Math.round( (newSum + rest) * 1e2 ) / 1e2;
                }
                // We did not add too much, but we want to make sure, that we don't add too less.
                else {
                    // To ensure this, we will add the rest in the last iteration.
                    // This will always happen to the last budget, but the above case (rest is negative) will do, too.
                    // So hopefully, this will balance out in the long term.
                    if ( i === budgets.length - 1 ) newSum = Math.round( (newSum + rest) * 1e2 ) / 1e2;
                }
                // Save the earning data.
                var earningObj = {"date": date, "name": earning, "amount": newSum,
                                  "budget": budgets[i][0], "type": "earning", "category": category};
                storeData( earningObj );
                // Now, update allTimeEarnings and the current balance.
                allTimeEarnings[i][1] = Math.round( (allTimeEarnings[i][1] + newSum) * 1e2 ) / 1e2;
                budgets[i][1] = Math.round( (budgets[i][1] + newSum) * 1e2 ) / 1e2;
                // Write back to storage.
                writeMainStorage( "budgets", budgets );
                writeMainStorage( "allTimeEarnings", allTimeEarnings );
            }
        }
    }
    // Don't split the sum
    else {
        // Create a JSON object containing the data.
        var earningObj = {"date": date, "name": earning, "amount": sum, "budget": budget,
                          "type": "earning", "category": category};
        // Now store the data in the corresponding .json file.
        storeData( earningObj );
        // Update the reference in the mainStorage.
        var budgets = readMainStorage( "budgets" );
        var allTimeEarnings = readMainStorage( "allTimeEarnings" );
        // Search for the correct budget.
        for ( var i = 0; i < allTimeEarnings.length; i++ ) {
            // Found it? Then update the value.
            // Update all time earnings.
            if ( allTimeEarnings[i][0] === budget ) {
				allTimeEarnings[i][1] = Math.round( (allTimeEarnings[i][1] + sum) * 1e2 ) / 1e2;
            }
            // Update the current balance of the budget.
            if ( budgets[i][0] === budget ) {
				budgets[i][1] = Math.round( (budgets[i][1] + sum) * 1e2 ) / 1e2;
            }
        }
        // Write back to storage.
        writeMainStorage( "budgets", budgets );
        writeMainStorage( "allTimeEarnings", allTimeEarnings );
    }
}