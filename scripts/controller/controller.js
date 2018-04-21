/**************************************************************************************************
 * This file contains controlling functions which need to be accessed from multiple pages.
**************************************************************************************************/

// Module to create charts.
const Chart = require( 'chart.js' );
// Needed for further modules.
const { remote } = require( 'electron' );
// Module for dialogues (needed when setting the path or to display error messages).
const { dialog } = require( 'electron' ).remote;
// Neccessary to set the window size.
const win = remote.getCurrentWindow();
// This saves available colors for charts.
const colors = ['rgba(255,99,132,1)', 'rgba(54, 162, 235, 1)', 'rgba(255, 206, 86, 1)', 'rgba(75, 192, 192, 1)', 'rgba(153, 102, 255, 1)', 'rgba(255, 159, 64, 1)'];

/**
 * This function sets the language.
 * @param {String} language The new language.
 */
function setLanguage( language ) {
    // Display the new language.
    switch ( language ) {
        case "en":
            $( "[lang=de]" ).hide();
            $( "[lang=en]" ).show();
            break;
        case "de":
            $( "[lang=en]" ).hide();
            $( "[lang=de]" ).show();
            break;
        // Default: English
        default:
            $( "[lang=de]" ).hide();
            $( "[lang=en]" ).show();
            break;
    }
    // Save the new language.
    storePreference( "language", language );
}

/**
 * This function returns the currently selected language.
 * @return {String} The currently selected language.
 */
function getLanguage() {
    // Find out, which language is selected and return it.
    var currentLanguage = readPreference( "language" );
    switch ( currentLanguage ) {
        case "en":
            return "en";
        case "de":
            return "de";
        // We want English to be our default language.
        default:
            return "en";
    }
}

/**
 * This function returns the currency sign.
 * @return {String} An HTML representation of the currency sign.
 */
function getCurrencySign() {
    // Find out, which currency is selected and choose the appropriate sign.
    var currentCurrency = readPreference( "currency" );
    switch ( currentCurrency ) {
        case "Euro":
            return "&euro;";
        case "Dollar":
            return "&dollar;";
        case "Pound":
            return "&pound;";
        default:
            return "&euro;";
    }
}

/**
 * Creates a chart to visualize the input data.
 * @param {Object} canvas The canvas which contains the chart.
 * @param {String[]} categories The labels for the data.
 * @param {float[]} dataset The data that will be visualized.
 * @param {String[]} bgcolors Backgroundcolors in the diagram.
 * @param {String[]} bdcolors Bordercolors in the diagram.
 * @param {String} charttype The type of the chart.
 */
function createChart( canvas, categories, dataset, bgcolors, bdcolors, charttype ) {
     spendingChart = new Chart( canvas, {
        type: charttype,
        data: {
            labels: categories,
            datasets: [{
                data: dataset,
                backgroundColor: bgcolors,
                borderColor: bdcolors,
                borderWidth: 0
            }]
        },
        // Don't show axes.
        options: {
            display: false
        }
    });
}

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
    var spendingObj = {"date": date, "name": spending, "amount": sum, "budget": budget, "type": "spending", "category": category};
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
                var earningObj = {"date": date, "name": earning, "amount": newSum, "budget": budgets[i][0], "type": "earning", "category": category};
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
        var earningObj = {"date": date, "name": earning, "amount": sum, "budget": budget, "type": "earning", "category": category};
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
                allTimeEarnings[i][1] += sum;
            }
            // Update the current balance of the budget.
            if ( budgets[i][0] === budget ) {
                budgets[i][1] += sum;
            }
        }
        // Write back to storage.
        writeMainStorage( "budgets", budgets );
        writeMainStorage( "allTimeEarnings", allTimeEarnings );
    }
}

/**
 * This function deletes a recurring transaction.
 * @param {String} name The name of the transaction we want to delete.
 */
function deleteRecurringTransaction( name ) {
    // Get current transactions.
    var currentRecurringTransactions = readMainStorage( "recurring" );
    // Search the transaction we want to delete.
    for ( var i = 0; i < currentRecurringTransactions.length; i++ ) {
        // Found it? Delete it and stop.
        if ( currentRecurringTransactions[i].name === name ) {
            currentRecurringTransactions.splice( i, 1 );
            break;
        }
    }
    // Write back to mainStorage.json.
    writeMainStorage( "recurring", currentRecurringTransactions );
    // Update the view: Don't display the transaction anymore.
    updateView();
}

/**
 * This function returns the new date for a recurring transactions.
 * @param {number} startDate The start date as a timestamp in seconds.
 * (we need this to keep the correct day after overflows)
 * @param {number} oldDate The old date as a timestamp in seconds.
 * @param {number} interval The interval (which is the selected index).
 */
function getNewDate( startDate, oldDate, interval ) {
    // Intervals, in which we add only days. Therefore, we don't need to check for
    // overflows in here.
    if ( interval === 0 || interval === 1 ) {
        // Weekly interval?
        if ( interval === 0 ) {
            // Add exactly 7 days.
            return oldDate + 604800;
        }
        // Every 4 weeks?
        else if ( interval === 1 ) {
            // Add exactly 28 days.
            return oldDate + 2419200;
        }
    }
    // These are all intervals in which overflows can occur. So we need to check for
    // overflows and handle them in here.
    else {
        // Create a new date object (Remember to multiply by 1000 to get milliseconds).
        var tmp = new Date( oldDate * 1000 );
        // Keep a reference on the old month (to check for overflows).
        var oldMonth = tmp.getMonth();
        // Monthly?
        if ( interval === 2 ) {
            // Increment the month by 1 (monthly interval).
            tmp.setMonth( tmp.getMonth() + 1 );
        }
        // Bimonthly?
        else if ( interval === 3 ) {
            // Increment the month by 2 (bimonthly interval).
            tmp.setMonth( tmp.getMonth() + 2 );
        }
        // Quarterly
        else if ( interval === 4 ) {
            // Increment the month by 3 (quarterly interval).
            tmp.setMonth( tmp.getMonth() + 3 );
        }
        // Biannual?
        else if ( interval === 5 ) {
            // Increment the month by 6 (biannual interval).
            tmp.setMonth( tmp.getMonth() + 6 );
        }
        // Annual?
        else if ( interval === 6 ) {
            // Increment the month by 12 (annual interval).
            tmp.setMonth( tmp.getMonth() + 12 );
        }
        // Make sure that we keep the correct day, in case no overflow happened.
        if ( oldMonth + 1 === tmp.getMonth() ) {
            tmp.setDate( new Date( startDate * 1000 ).getDate() );
        }
        // Check, if an overflow emerges.
        if ( oldMonth + 1 !== tmp.getMonth() ) {
            // Setting the day to zero will give us the last day of the previous month.
            var newDate = new Date( tmp.getFullYear(), tmp.getMonth(), 0 );
            // Remember to divide by 1000 because we want to get seconds.
            return Math.floor( newDate.getTime() / 1000 );
        }
        // No overflow?
        else {
            // Remember to divide by 1000 because we want to get seconds.
            return Math.floor( tmp.getTime() / 1000 );
        }
    }
}

/**
 * This function checks if an input for an amount is valid.
 * @param {String} input The input we want to check.
 * @param {bool} emptyOk This indicates if an empty input is ok.
 * @return {bool} A boolean which indiates if the amount is valid.
 */
function checkAmountInput( input, emptyOk ) {
    input = input.replace( ",", "." );
    if ( emptyOk && input === "" ) return true;
    if ( /[a-z]/i.test( input ) || !/\d/.test( input ) ) return false;
    // Some character is not a digit? Make sure that this is only a single dot.
    // Also, make sure that there are not more than two decimal places.
    if ( /\D/.test ( input ) ) {
        // No dot or more than one dot found?
        // (Remember that we already found at least one non digit character, so there has to be a dot)
        if ( input.indexOf( "." ) === -1 || input.replace( ".", "" ).length + 1 < input.length ) return false;
        // Any other non digit characters found?
        if ( /\D/.test( input.replace( ".", "" ) ) ) return false;
        // More than two decimal digits in the sum?
        // Remember that the input was already checked, so there is exactly one dot.
        if ( input.split( "." )[1].length > 2 ) return false;
        // Note: Inputs like .5 are okay since parseFloat( ".5" ) = 0.5
    }
    return true;
}
