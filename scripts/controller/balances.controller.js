/**
 * This file controls all actions on the balances page.
 *
 * @author Malte311
 */

/**
 * This function initializes the page when its loaded. This means it sets the
 * language and the content.
 */
function loadPage() {
    // We will always set the language first.
    setLanguage( readPreference( "language" ) );
    // Display a list of currently available budgets and display every budget in detail.
    updateView();
}

/**
 * This function adds a new transaction, either unique or recurring.
 */
function addTransaction() {
    // First, get all budgets to offer a selection between them.
    var currentBudgets = readMainStorage( "budgets" );
    // We will add all the content to this and then display it in the dialog.
    var options = "";
    // Display an option for every available budget, so the user can select any budget.
    for ( var i = 0; i < currentBudgets.length; i++ ) {
        options += "<option value=\"" + currentBudgets[i][0] + "\">" + currentBudgets[i][0] + "</option>";
    }
    // Find out which language is selected to set the text elements of the dialog.
    var textElementsLocal = textElements.transactionDialogTextElements;
    // Set options for selecting an interval (when automation is avtivated).
    var intervalOptions = "", intervalOptionsTextElements = textElements.intervalOptionsTextElements;
    for ( var i = 0; i < intervalOptionsTextElements.length; i++ ) {
        // Monthly? Set as default (keep in mind that "monthly" has to be index 2 all the time).
        if ( i === 2 ) {
            intervalOptions += "<option selected=\"selected\">" + intervalOptionsTextElements[i] + "</option>";
        }
        // Not monthly? Not selected.
        else {
            intervalOptions += "<option>" + intervalOptionsTextElements[i] + "</option>";
        }
    }
    // Set the complete content for the dialog.
    // First two lines are radio buttons to select between earning and spending.
    var text = textElementsLocal[0] +
               "<form class=\"w3-center\"><input id=\"earning\"" +
                    "onclick=\"updateTransactionDialog();\" type=\"radio\" name=\"type\">" +
                    textElementsLocal[1] +
                    "<input id=\"spending\" onclick=\"updateTransactionDialog();\"" +
                    "style=\"margin-left:15px;\" type=\"radio\" name=\"type\" checked>" +
                    textElementsLocal[2] +
               "</form><hr>" +
               // Input for name and amount.
               "<div>" +
                    "<div>" +
                        "<b>" + textElementsLocal[3] +
                        "</b><br><input type=\"text\" id=\"nameInput\">" +
                    "</div>" +
                    "<div>" +
                        "<b>" + textElementsLocal[4] +
                        "</b><br><input style=\"width=50px;\" type=\"text\" id=\"sumInput\">" +
                    "</div>" +
               "</div><br>" +
               // Input for category.
               "<div>" +
                    "<b>" + textElementsLocal[5] + "</b>" + " " + textElementsLocal[6] +
                    "<br><input type=\"text\" id=\"categoryInput\">" + "  " +
                    // Input for the date.
                    textElementsLocal[7] + ": " +
                    "<input id=\"datepicker1\" class=\"w3-round-large w3-light-gray\"" +
                    "type=\"button\" onclick=\"showDatepicker('1');\"" +
                    "value=\"" + dateToString( getCurrentDate() ) + "\">" +
               "</div>" +
               // Choose between manual and automated allocation. Hidden until "earning" is selected.
               "<div id=\"dynamicDiv1\" style=\"display:none;\"><hr>" +
                    "<form class=\"w3-center\"><input id=\"manual\"" +
                    "onclick=\"updateTransactionDialog();\" type=\"radio\" name=\"allocation\">" +
                    textElementsLocal[8] +
                    "<input id=\"autoAllocation\" onclick=\"updateTransactionDialog();\"" +
                    "style=\"margin-left:15px;\" type=\"radio\" name=\"allocation\" checked>" +
                    textElementsLocal[9] + "</form>" +
               "</div>"
               // Budget select will be displayed at the beginning
               // (because spending is selected as a default).
               "<div id=\"dynamicDiv2\"><hr><b>" +
                    textElementsLocal[10] + "</b><br>" +
                    "<select id=\"selectInput\">" + options + "</select>" +
               "</div><hr>" +
               // Option to automate this transaction.
               "<div id=\"budgetSelect\"></div>" +
               "<input type=\"checkbox\" id=\"checkboxInput\"" +
               "onclick=\"updateTransactionDialog();\">" + textElementsLocal[11] +
               // Another dynamic div, which changes when the checkbox is activated/deactivated.
               "<br>" +
               "<div id=\"dynamicDiv3\" style=\"display:none;\">" +
                   "<select id=\"intervalSelect\">" + intervalOptions + "</select>" +
                   "  " + textElementsLocal[12] + ": " +
                   "<input id=\"datepicker2\" class=\"w3-round-large w3-light-gray\"" +
                   "type=\"button\" onclick=\"showDatepicker('2');\" value=\"" +
                   textElementsLocal[13] + "\">" +
               "</div>";
    // Now we are able to actually create a dialog.
    createDialog( textElements.addTransaction, text, function() {
        // Save the inputs and then execute the right function to add a new entry.
        var name = $( "#nameInput" ).val().trim();
        var sum = $( "#sumInput" ).val().trim();
        var category = $( "#categoryInput" ).val().trim();
        // Replace all commas with dots to make sure that parseFloat() works as intended.
        sum = sum.replace( ",", "." );
        // Make sure that the input is ok.
        var inputOk = true;
        // Make sure that the name is not empty. Category can be empty. (sum will be checked below)
        if ( name.length < 1 ) inputOk = false;
        // Make sure that the sum contains no letters and that it contains at least one number.
        if ( /[a-z]/i.test( sum ) || !/\d/.test( sum ) ) inputOk = false;
        // Some character is not a digit? Make sure that this is only a single dot.
        // Also, make sure that there are not more than two decimal places.
        if ( /\D/.test ( sum ) ) {
            // No dot or more than one dot found?
            // (Remember that we already found at least one non digit character, so there has to be a dot)
            if ( sum.indexOf( "." ) === -1 || sum.replace( ".", "" ).length + 1 < sum.length ) inputOk = false;
            // Any other non digit characters found?
            if ( /\D/.test( sum.replace( ".", "" ) ) ) inputOk = false;
            // More than two decimal digits in the sum?
            if ( inputOk ) {
                // Remember that the input was already checked, so there is exactly one dot.
                if ( sum.split( "." )[1].length > 2 ) {
                    inputOk = false;
                }
            }
            // Note: Inputs like .5 are okay since parseFloat( ".5" ) = 0.5
        }
        // Input ok? Then continue.
        if ( inputOk ) {
            // Get the selected budget.
            var budget = $( "#selectInput option:selected" ).text();
            // Get the selected date.
            var selectedDate = $( "#datepicker1" ).datepicker( "getDate" );
            var date, endDate;
            // Make sure, a date was selected.
            if ( selectedDate !== null && selectedDate !== undefined ) {
                // Remember that we want dates in seconds, so we divide by 1000.
                date = Math.floor( new Date( selectedDate ).getTime() / 1000 );
            }
            // Otherwise use the current date (today).
            else {
                date = getCurrentDate();
            }
            var selectedEndDate = $( "#datepicker2" ).datepicker( "getDate" );
            if ( selectedEndDate !== null && selectedEndDate !== undefined ) {
                endDate = Math.floor(
                    new Date( $( "#datepicker2" ).datepicker( "getDate" ) ).getTime() / 1000 );
            }
            // End date -1 means there is no end date.
            else {
                endDate = -1;
            }
            // Find out which type (earning/spending) was selected and
            // execute the correct function.
            if ( $( "#earning" )[0].checked ) {
                addEarning( name, parseFloat( sum ), budget, category, date,
                    $( "#autoAllocation" )[0].checked && readMainStorage( "allocationOn" ) );
            }
            else if ( $( "#spending" )[0].checked ) {
                addSpending( name, parseFloat( sum ), budget, category, date );
            }

            // Automation activated?
            if ( $( "#checkboxInput" )[0].checked ) {
                // Add a new recurring transaction.
                var type = $( "#earning" )[0].checked ? "earning" : "spending";
                addRecurringTransaction( name, parseFloat( sum ), budget, category, type,
                    $("#intervalSelect")[0].selectedIndex, date, endDate );
            }
            // Close the dialog and update the view.
            $( this ).dialog( "close" );
            updateView();
            // Add the inputs to our array for autocomplete.
            var availableNames = readMainStorage( "availableNames" );
            availableNames.push( name );
            // Make sure, we have only unique elements.
            availableNames = availableNames.filter( function( value, index, self ) {
                return self.indexOf( value ) === index;
            });
            var availableCategories = readMainStorage( "availableCategories" );
            availableCategories.push( category );
            // Make sure, we have only unique elements.
            availableCategories = availableCategories.filter( function( value, index, self ) {
                return self.indexOf( value ) === index;
            });
            // Write back to storage.
            writeMainStorage( "availableNames", availableNames );
            writeMainStorage( "availableCategories", availableCategories );
        }
        // Wrong input: Show error message.
        else {
            dialog.showErrorBox( "Error", "Invalid input." );
        }
    });

    // Autocomplete for user inputs.
    $( "#nameInput" ).autocomplete({
      source: readMainStorage( "availableNames" )
    });
    $( "#categoryInput" ).autocomplete({
      source: readMainStorage( "availableCategories" )
    });
}

/**
 * This function creates a recurring transaction.
 * @param {String} name The name of the transaction.
 * @param {double} amount The amount of the transaction.
 * @param {String} budget The budget for the transaction.
 * @param {String} category The category of the transaction.
 * @param {String} type The type of the transaction.
 * @param {number} interval The interval of the transaction (in seconds).
 * @param {number} date The date of the transaction (in seconds).
 * @param {number} endDate The date on which the transactions ends (-1 if it never ends).
 */
function addRecurringTransaction( name, amount, budget, category, type, interval, date, endDate ) {
    // Determine, if this transaction involves the automatic allocation.
    var allocationOn = $( "#earning" )[0].checked &&
                       $( "#autoAllocation" )[0].checked &&
                       readMainStorage( "allocationOn" );
    // Determine the correct date.
    var newDate = getNewDate( date, date, interval );
    // Just continue, if the transaction recurrs at least once.
    // (either no end date or end date is not reached yet)
    if ( endDate < 0 || (endDate > 0 && newDate <= endDate) ) {
        // Create a new object and store it (in the mainStorage.json file).
        var dataObj = {"startDate": date, "nextDate": newDate, "endDate": endDate, "name": name,
                       "amount": amount, "budget": budget, "type": type, "category": category,
                       "interval": interval, "allocationOn": allocationOn};
        // Now, get the existing data and add this data to it.
        var currentRecurringTransactions = readMainStorage( "recurring" );
        currentRecurringTransactions.push( dataObj );
        writeMainStorage( "recurring", currentRecurringTransactions );
        // Now, set update to false, because we did not update the new transction yet.
        writeMainStorage( "update", false );
        // Update the new transaction.
        executeRecurringTransactions();
        // This function is called in addTransaction, so no need to update the view here,
        // since it is already done.
    }
}

/**
 * This function creates a new budget. It opens a dialog in which the user types
 * in a name for the new budget.
 */
function addBudget() {
    // Add an input field to the dialog
    createDialog( textElements.addBudget,
                  textElements.budgetName + "<br><input type=\"text\" id=\"dialogInput\">", function() {
        // Get all currently available budgets.
        var currentBudgets = readMainStorage( "budgets" );
        // Save the new budget (the input from the user).
        var newBudget = $( "#dialogInput" ).val().trim();
        // This is for checking if the entered name already exists.
        var alreadyExists = false;
        // This loop is just for making sure the entered input is not existing yet.
        for ( var i = 0; i < currentBudgets.length; i++ ) {
            // Input exists? Set variable to true and stop.
            if ( currentBudgets[i][0] === newBudget ) {
                alreadyExists = true;
                break;
            }
        }
        // Only add a new budget if it does not already exist and its name is not empty.
        if ( !alreadyExists && newBudget !== "" ) {
            // The balance of the new budget starts at 0.
            currentBudgets.push( [newBudget, 0.0] );
            // Save a reference to the new budget in the mainStorage.json file.
            writeMainStorage( "budgets", currentBudgets );
            // Update all time earnings and spendings for the new budget (set it to zero).
            var allTimeEarnings = readMainStorage( "allTimeEarnings" );
            allTimeEarnings.push( [newBudget, 0] );
            writeMainStorage( "allTimeEarnings", allTimeEarnings );
            var allTimeSpendings = readMainStorage( "allTimeSpendings" );
            allTimeSpendings.push( [newBudget, 0] );
            writeMainStorage( "allTimeSpendings", allTimeSpendings );
            // Do the same for the allocation (set the allocation of the new budget to zero).
            var allocation = readMainStorage( "allocation" );
            allocation.push( [newBudget, 0] );
            writeMainStorage( "allocation", allocation );
            // Update the view: List the new budget.
            updateView();
        }
        // Close the dialog (since this function is only executed when the OK button is pressed)
        $( this ).dialog( "close" );
    });
}

/**
 * This function deletes a budget. Before deleting it, we will show a dialog to
 * ask if deleting the budget is really wanted.
 * @param {String} name The name of the budget we want to delete.
 */
function deleteBudget( name ) {
    createDialog( textElements.deleteBudget, textElements.reallyDelete, function() {
        // Get all currently available budgets.
        var currentBudgets = readMainStorage( "budgets" );
        // Delete the budget in all time earnings/spendings as well.
        var allTimeEarnings = readMainStorage( "allTimeEarnings" );
        var allTimeSpendings = readMainStorage( "allTimeSpendings" );
        // Also delete it in allocation.
        var allocation = readMainStorage( "allocation" );
        // We add all budgets except the one we want to delete.
        var updatedBudgets = [],
            updatedAllTimeEarnings = [],
            updatedAllTimeSpendings = [],
            newAllocation = [];
        // Search for the correct budget to delete it. (Note that all arrays
        // have the same length and the same order, so we can use the same index)
        for ( var i = 0; i < currentBudgets.length; i++ ) {
            // Add all budgets except the one we want to delete.
            if ( currentBudgets[i][0] !== name ) {
                updatedBudgets.push( currentBudgets[i] );
            }
            // Do the same for allTimeEarnings and allTimeSpendings.
            if ( allTimeEarnings[i][0] !== name ) {
                updatedAllTimeEarnings.push( allTimeEarnings[i] );
            }
            if ( allTimeSpendings[i][0] !== name ) {
                updatedAllTimeSpendings.push( allTimeSpendings[i] );
            }
            // And for allocation as well.
            if ( allocation[i][0] !== name ) {
                newAllocation.push( allocation[i] );
            }
            // Remember that the sum of allocation amounts could be changed now.
            // Make sure it will be 100 percent again.
            else {
                // More than 0 percent allocation ratio?
                if ( allocation[i][1] > 0 ) {
                    // Add the amount to the standard budget
                    // (the standard budget is at index 0).
                    newAllocation[0][1] += allocation[i][1];
                }
            }
        }
        // Delete recurring transactions using this budget.
        var recurringTransactions = readMainStorage( "recurring" );
        var newRecurringTransactions = [];
        // Search for transactions involving this budget.
        for ( var i = 0; i < recurringTransactions.length; i++ ) {
            // Found the budget? Delete it.
            if ( recurringTransactions[i].budget !== name ) {
                // Note: splice() does not work here, since the array length will be cut
                // and therefore the loop will end too early.
                newRecurringTransactions.push(  recurringTransactions[i] );
            }
        }
        // Save the updated budgets in the mainStorage.json file.
        writeMainStorage( "budgets", updatedBudgets );
        // Again, we do this as well for allTimeEarnings and allTimeSpendings.
        writeMainStorage( "allTimeEarnings", updatedAllTimeEarnings );
        writeMainStorage( "allTimeSpendings", updatedAllTimeSpendings );
        // And for allocation as well.
        writeMainStorage( "allocation", newAllocation );
        // Also, delete recurring transactions.
        writeMainStorage( "recurring", newRecurringTransactions );
        // Update the view: Don't display the deleted budget anymore.
        updateView();
        // Close the dialog (since this function is only executed when the OK button is pressed)
        $( this ).dialog( "close" );
        // Now we can delete all data for this budget (in the background).
        var allFiles = getJSONFiles();
        for ( var i = 0; i < allFiles.length; i++ ) {
            // Filter the data. We will add all budgets, except the deleted one to the quest.
            var budgets = readMainStorage( "budgets" );
            // We start of with an empty param list and then add every param to add.
            var paramList = [];
            // Add a param for each budget (except for the deleted one).
            // We already updated the mainStorage, so the deleted budget is already gone.
            for ( var j = 0; j < budgets.length; j++ ) {
                paramList.push( ["budget", budgets[j][0]] );
            }
            var quest = { connector : "or", params : paramList };
            // Now, get the complete data.
            var data = getData( allFiles[i] + ".json", quest );
            // Make sure that there is data left.
            if ( data.length > 0 ) {
                // Now replace the data with the new data.
                replaceData( allFiles[i] + ".json", data );
            }
            // No data left? Delete the file.
            else {
                fs.unlinkSync( readPreference( "path" ) + path.sep + allFiles[i] + ".json" );
            }
        }
    });
}

/**
 * This function renames a budget.
 * @param {String} name The name of the budget we want to change.
 */
function renameBudget( name ) {
    // Add an input field.
    createDialog( textElements.renameBudget,
                  textElements.newBudgetName + "<br><input type=\"text\" id=\"dialogInput\">", function() {
        // Get all currently available budgets.
        var currentBudgets = readMainStorage( "budgets" );
        // Rename the budget in all time earnings/spendings as well.
        var allTimeEarnings = readMainStorage( "allTimeEarnings" );
        var allTimeSpendings = readMainStorage( "allTimeSpendings" );
        // For allocation as well.
        var allocation = readMainStorage( "allocation" );
        // We add all budgets to this (and the renamed one with its new name)
        var updatedBudgets = [],
            updatedAllTimeEarnings = [],
            updatedAllTimeSpendings = [],
            newAllocation = [];
        var newName = $( "#dialogInput" ).val().trim();
        // Iterate over them to find the one we want to rename.
        // Remember that all the fields are all in the same order, so we can use the same index.
        for ( var i = 0; i < currentBudgets.length; i++ ) {
            // Found it? Rename it.
            if ( currentBudgets[i][0] === name ) {
                updatedBudgets.push( [newName, currentBudgets[i][1]] );
            }
            // Not the budget we are looking for? Push the budget unmodified.
            else {
                updatedBudgets.push( currentBudgets[i] );
            }
            // Do the same for allTimeEarnings and allTimeSpendings.
            if ( allTimeEarnings[i][0] === name ) {
                updatedAllTimeEarnings.push( [newName, allTimeEarnings[i][1]] );
            }
            else {
                updatedAllTimeEarnings.push( allTimeEarnings[i] );
            }

            if ( allTimeSpendings[i][0] === name ) {
                updatedAllTimeSpendings.push( [newName, allTimeSpendings[i][1]] );
            }
            else {
                updatedAllTimeSpendings.push( allTimeSpendings[i] );
            }
            // And for allocation as well.
            if ( allocation[i][0] === name ) {
                newAllocation.push( [newName, allocation[i][1]] );
            }
            else {
                newAllocation.push( allocation[i] );
            }
        }
        // Rename recurring transactions using this budget.
        var recurringTransactions = readMainStorage( "recurring" );
        // Search for transactions involving this budget.
        for ( var i = 0; i < recurringTransactions.length; i++ ) {
            // Found the budget? Rename it.
            if ( recurringTransactions[i].budget === name ) {
                recurringTransactions[i].budget = newName;
            }
        }
        // Save the updated budgets in the mainStorage.json file.
        writeMainStorage( "budgets", updatedBudgets );
        // Again, we do this as well for allTimeEarnings and allTimeSpendings.
        writeMainStorage( "allTimeEarnings", updatedAllTimeEarnings );
        writeMainStorage( "allTimeSpendings", updatedAllTimeSpendings );
        // Also, rename recurring transactions.
        writeMainStorage( "recurring", recurringTransactions );
        // Same for allocation.
        writeMainStorage( "allocation", newAllocation );
        // Update the view: Display the new name.
        updateView();
        // Close the dialog (since this function is only executed when the OK button is pressed)
        $( this ).dialog( "close" );
        // Now we can rename all data for this budget (in the background).
        var allFiles = getJSONFiles();
        for ( var i = 0; i < allFiles.length; i++ ) {
            // Filter the data. First, we get ALL data (earning OR spending will deliver everything).
            var quest = { connector : "or", params : [["type", "earning"],["type", "spending"]] };
            // Now, get the data.
            var data = getData( allFiles[i] + ".json", quest );
            // Iterate over all the data and find the data which has to be renamed.
            for ( var j = 0; j < data.length; j++ ) {
                // Found the correct budget? Rename it.
                if ( data[j].budget === name ) {
                    data[j].budget = newName;
                }
            }
            // Now replace the old data with the new data.
            replaceData( allFiles[i] + ".json", data );
        }
    });
}

/**
 * This function opens the automated allocation dialog.
 */
function setAllocation() {
    // Get all the text elements of the dialog.
    var textElementsLocal = textElements.allocationDialogTextElements;
    // We want to display all budgets and their allocations.
    var currentBudgets = readMainStorage( "budgets" );
    var currentAllocation = readMainStorage( "allocation" );
    var currentBudgetsHTML = "";
    // Display currently selected value as selected.
    // Note: The allocation array has the same length as the budgets array.
    // Additionally, the indizes are corresponding, so we don't need further checking.
    // (Obviously, this is only true if nobody manipulated the .json file)
    for ( var i = 0; i < currentBudgets.length; i++ ) {
        // We need a precise id of every selection
        // (every budget has its own selection with 10 options in it).
        var currentAllocationHTML = "";
        // We want to loop from 0 to 10, because the options should range
        // from 0 to 100 percent, with an increase of 10 per step.
        for ( var j = 0; j <= 10; j++ ) {
            // We display the previously selected value as selected.
            if ( j * 10 === currentAllocation[i][1] ) {
                // Note that we have 10 options for every budget.
                currentAllocationHTML +=
                    "<option selected=\"selected\">" + currentAllocation[i][1] + "&percnt;</option>";
            }
            // This is for every other value (not previously selected).
            else {
                currentAllocationHTML += "<option>" + (j * 10).toString() + "&percnt;</option>";
            }
        }
        // This holds the lines of the table.
        currentBudgetsHTML += "<tr class=\"w3-hover-light-blue\">" +
                              "<td>" + currentBudgets[i][0] + "</td>" +
                              "<td><select class=\"w3-select\" id=\"percentageSelect"
                              + i.toString() + "\">" + currentAllocationHTML +
                              "</select></td></tr>";
    }
    // This holds the checkbox to activate/deactivate the allocation (and a tooltip).
    var activateCheckBox = "<br><br>" +
                           "<input type=\"checkbox\" id=\"autoAllocation\"> " +
                           textElementsLocal[1] + " " +
                           "<div class=\"tooltip\">" +
                           "<i class=\"fas fa-info-circle\"></i><span class=\"tooltiptext\">" +
                           textElementsLocal[2] +
                           "</span></div>";
    // Now combine the elements to set the complete content of the dialog.
    var text = textElementsLocal[0] + activateCheckBox +
               "<br><hr>" +
               "<table class=\"w3-table-all\">" +
               "<tr><th>" + textElementsLocal[3] + "</th>" +
               "<th>" + textElementsLocal[4] + "</th>" +
               currentBudgetsHTML + "</tr></table>";
    // Create a new dialog.
    createDialog( textElements.autoAllocation, text, function() {
        // Get the allocation array and iterate over it.
        var allocation = readMainStorage( "allocation" );
        // Since we want to write, we need a new object to which we push the new data.
        var newAllocation = [];
        // Set the selected value for every budget. In addition to that, we will calculate
        // the sum, to check if it is exactly 100%.
        var checkSum = 0;
        for ( var i = 0; i < allocation.length; i++ ) {
            var value = $( "#percentageSelect" + i + " " + "option:selected" ).text();
            newAllocation.push( [allocation[i][0], parseInt( value )] );
            checkSum += parseInt( value );
        }
        // Check, if input is O.K.
        if ( checkSum === 100 ) {
            // Now write the updated values in the storage.
            writeMainStorage( "allocation", newAllocation );
            // Get the value of the checkbox and save it in the main storage.
            setAllocationOn();
            // Close the dialog and update the view.
            $( this ).dialog( "close" );
            updateView();
        }
        // Input not O.K.? Show error message.
        else {
            dialog.showErrorBox( "Error", "The sum of the parts has to be 100%!" );
        }
    });
    // Display checkbox as selected if it was selected previously.
    if ( readMainStorage( "allocationOn" ) ) $( "#autoAllocation" )[0].checked = true;
}

/**
 * This function sets the value of "allocationOn".
 */
function setAllocationOn() {
    // Checkbox activated?
    if ( $( "#autoAllocation" )[0].checked ) {
        writeMainStorage( "allocationOn", true );
    }
    // Checkbox not activated?
    else {
        writeMainStorage( "allocationOn", false );
    }
}

/**
 * This function activates the date range picker on a specified element.
 * @param {String} id The id of the element on which the date range picker should be displayed.
 */
function activateDateRangePicker( id ) {
    // Get all the text we need in the correct language.
    var textElementsLocal = textElements.rangeDatePickerPreset;
    var currentDate = new Date( getCurrentDate() * 1000 );
    // Create a new date range picker.
    $( id ).daterangepicker({
        // First day of the month? Only display this single day. Otherwise display the current month.
        initialText: currentDate.getDate() === 1 ?
                     dateToString( getCurrentDate() ) :
                     dateToString( new Date( currentDate.getFullYear(),
                                             currentDate.getMonth(), 1 ).getTime() / 1000 ) +
                                             " - " + dateToString( getCurrentDate() ),
        dateFormat: "dd.mm.yy",
        applyButtonText: textElements.apply,
        clearButtonText: textElements.clear,
        cancelButtonText: textElements.cancel,
        presetRanges: [
			{text: textElementsLocal[0],
                dateStart: function() {
                    return moment()
                },
                dateEnd: function() {
                    return moment()
                }
            },
			{text: textElementsLocal[1],
                dateStart: function() {
                    return moment().subtract('days', 1)
                },
                dateEnd: function() {
                    return moment().subtract('days', 1)
                }
            },
			{text: textElementsLocal[2],
                dateStart: function() {
                    return moment().subtract('days', 6)
                },
                dateEnd: function() {
                    return moment()
                }
            },
			{text: textElementsLocal[3],
                dateStart: function() {
                    return moment().subtract('days', 7).isoWeekday(1)
                },
                dateEnd: function() {
                    return moment().subtract('days', 7).isoWeekday(7)
                }
            },
			{text: textElementsLocal[4],
                dateStart: function() {
                    return moment().startOf('month')
                },
                dateEnd: function() {
                    return moment()
                }
            },
			{text: textElementsLocal[5],
                dateStart: function() {
                    return moment().subtract('month', 1).startOf('month')
                },
                dateEnd: function() {
                    return moment().subtract('month', 1).endOf('month')
                }
            },
			{text: textElementsLocal[6],
                dateStart: function() {
                    return moment().startOf('year')
                },
                dateEnd: function() {
                    return moment()
                }
            },
            {text: textElementsLocal[7],
                dateStart: function() {
                    return moment().subtract('year', 1).startOf('year')
                },
                dateEnd: function() {
                    return moment().subtract('year', 1).endOf('year')
                }
            }
		]
    });
}

/**
 * This function updates the content if the user clicks the update button to apply filters.
 */
function updateContent() {
    // Check for controls
    if ( $( "#graph" ).length ) {
        // Get all the information from input elements and save them in variables first.
        // Get the selected display type (graph/table).
        var displayType = $( "#graph" )[0].checked ? "graph" : "table";
        // Find out, if a budget is selected, and if yes, which one.
        var budget;
        // Budget selected?
        if ( $( "#budgetSelect" )[0].selectedIndex !== 0 ) {
            // Get the name of the selected budget.
            budget = $( "#budgetSelect option:selected" ).text();
        }
        // No budget selected?
        else {
            // Save an empty string.
            budget = "";
        }
        // Find out, if a type is selected, and if yes, which one.
        var type;
        // Type selected?
        if ( $( "#typeSelect" )[0].selectedIndex !== 0 ) {
            // Find out which type is selected.
            // Earning?
            if ( $( "#typeSelect" )[0].selectedIndex === 1 ) type = "earning";
            // Spending?
            else if ( $( "#typeSelect" )[0].selectedIndex === 2 ) type = "spending";
        }
        // No type selected?
        else {
            // Save an empty string.
            type = "";
        }
        // Get the input from the date range picker to get a date range.
        var date = $( "#dateSelect" ).daterangepicker( "getRange" );
        // Set start and end date to null, in case nothing was selected.
        var startDate = null, endDate = null;
        // Date selected? (No date selected will leave startDate and endDate with null)
        if ( date !== null && date !== undefined ) {
            // Get the selected start and end date.
            startDate = date.start;
            endDate = date.end;
        }
        // Get the input for amounts. If they are empty, we save the empty string.
        var amountFrom = $( "#amountFrom" ).val().trim();
        var amountTo = $( "#amountTo" ).val().trim();
        // Find out which name is selected. If no name is selected, we save the empty string.
        var name = $( "#nameSelect" ).val().trim();
        // Find out which category is selected. If no category is selected, we save the empty string.
        var category = $( "#categorySelect" ).val().trim();
        // Now display the filtered content.
        displayContent( displayType, budget, type, startDate, endDate, amountFrom,
                        amountTo, name, category );
    }
    // No controls available yet: Set default values.
    else {
        displayContent( "graph", "", "spending", null, null, "", "", "", "" );
    }
}

/**
 * This function creates a new dialog to execute transfers.
 */
function executeTransfer() {
    // Get all current budgets.
    var currentBudgets = readMainStorage( "budgets" );
    // Iterate over them
    var optionsFrom = "", optionsTo = "";
    for ( var i = 0; i < currentBudgets.length; i++ ) {
        optionsFrom += "<option>" + currentBudgets[i][0] + "</option>";
        optionsTo += "<option>" + currentBudgets[i][0] + "</option>";
    }
    var text = textElements.transferDialogTextElements[0] +
               "<br><hr>" +
               "<table class=\"w3-table-all\">" +
               "<tr><th>" + textElements.transferDialogTextElements[1] + "</th>" +
               "<th>" + textElements.transferDialogTextElements[2] + "</th></tr>" +
               "<tr><td><select class=\"w3-select\" id=\"budgetFrom\">" + optionsFrom +
               "</select></td>" +
               "<td><select class=\"w3-select\" id=\"budgetTo\">" + optionsTo +
               "</select></td></tr></table>" +
               "<br><hr>" + "<b>" + textElements.transferDialogTextElements[3] +
               "</b>: " + "<input style=\"width=50px;\" type=\"text\" id=\"transferAmount\">";
    // Create a new dialog.
    createDialog( textElements.transfer, text, function() {
        // Get input.
        var budgetFrom = $( "#budgetFrom option:selected" ).text();
        var budgetTo = $( "#budgetTo option:selected" ).text();
        var amountInput = $( "#transferAmount" ).val().trim();
        // Input valid?
        if ( checkAmountInput( amountInput, false ) ) {
            // Add the transfer.
            addTransfer( budgetFrom, budgetTo, parseFloat( amountInput ) );
            // Close the dialog and update the view.
            $( this ).dialog( "close" );
            updateView();
        }
        // Invalid input?
        else {
            dialog.showErrorBox( "Error", "Invalid input" );
        }
    });
}

/**
 * This function transfers money from one budget to another.
 * @param {String} budgetFrom The budget from which we want to transfer money.
 * @param {String} budgetTo The budget to which we want to transfer money.
 * @param {float} amount The amount we want to transfer.
 */
function addTransfer( budgetFrom, budgetTo, amount ) {
    // We just need to calculate if the budgets are different.
    if ( budgetFrom !== budgetTo ) {
        // Search for the correct budgets.
        var budgets = readMainStorage( "budgets" );
        for ( var i = 0; i < budgets.length; i++ ) {
            // Update the balances for the budgets.
            if ( budgets[i][0] === budgetFrom ) {
                // Make sure, that the amount is not too big (the money must exist).
                if ( amount > budgets[i][1] ) {
                    dialog.showErrorBox( "Error", "Not enough money available!" );
                    break;
                }
                budgets[i][1] = Math.round( (budgets[i][1] - amount) * 1e2 ) / 1e2;
            }
            if ( budgets[i][0] === budgetTo ) {
                budgets[i][1] = Math.round( (budgets[i][1] + amount) * 1e2 ) / 1e2;
            }
        }
        // Write back to main storage.
        writeMainStorage( "budgets", budgets );
    }
}
