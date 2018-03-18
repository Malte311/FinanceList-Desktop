/**
 * This function initializes the page when its loaded. This means it sets the
 * language and some of the content.
 */
function loadPage() {
    // We will always set the language first.
    setLanguage();
    // Display a list of currently available budgets and display every budget in detail.
    updateView();
}

/**
 * This function saves new spending entries in .json files.
 * @param {String} spending The name of the spending.
 * @param {double} sum The cost of the aquired thing.
 * @param {String} budget The budget from which the sum should be subtracted.
 */
function addSpending( spending, sum, budget ) {
    // Create a JSON object containing the data.
    var spendingObj = {"date": getCurrentDate(), "name": spending, "amount": sum, "budget": budget, "type": "spending"};
    // Now store the data in the corresponding .json file.
    storeData( spendingObj );
    // Update the reference in the mainStorage.
    var budgets = readMainStorage( "budgets" );
    var allTimeSpendings = readMainStorage( "allTimeSpendings" );
    // Search for the correct budget.
    for ( var i = 0; i < allTimeSpendings.length; i++ ) {
        // Found it? Then update the value.
        if ( allTimeSpendings[i][0] === budget ) {
            allTimeSpendings[i][1] += sum;
        }
        if ( budgets[i][0] === budget ) {
            budgets[i][1] -= sum;
        }
    }
    // Write back to storage.
    writeMainStorage( "budgets", budgets );
    writeMainStorage( "allTimeSpendings", allTimeSpendings );
    // Update the view: Display the new balance.
    updateView();
}

/**
 * This function saves new earnings entries in .json files.
 * @param {String} earning The name of the earning.
 * @param {double} sum The amount of the earning.
 * @param {String} budget The budget to which the sum should be added.
 */
function addEarning( earning, sum, budget ) {
    // Create a JSON object containing the data.
    var spendingObj = {"date": getCurrentDate(), "name": earning, "amount": sum, "budget": budget, "type": "earning"};
    // Now store the data in the corresponding .json file.
    storeData( spendingObj );
    // Update the reference in the mainStorage.
    var budgets = readMainStorage( "budgets" );
    var allTimeEarnings = readMainStorage( "allTimeEarnings" );
    // Search for the correct budget.
    for ( var i = 0; i < allTimeEarnings.length; i++ ) {
        // Found it? Then update the value.
        if ( allTimeEarnings[i][0] === budget ) {
            allTimeEarnings[i][1] += sum;
        }
        if ( budgets[i][0] === budget ) {
            budgets[i][1] += sum;
        }
    }
    // Write back to storage.
    writeMainStorage( "budgets", budgets );
    writeMainStorage( "allTimeEarnings", allTimeEarnings );
    // Update the view: Display the new balance.
    updateView();
}

/**
 * This function creates dialogues for adding, renaming and deleting budgets.
 * @param {String} title The title of the dialog.
 * @param {String} text The text message of the dialog.
 * @param {bool} withInput This indicates if the dialog has an input field or not.
 * @param {function} okFunction A function to be executed when the OK button was pressed.
 */
function createDialog( title, text, withInput, okFunction ) {
    // Find out which language is selected to set the text elements of the dialog.
    var currentLanguage = readPreference( "language" );
    var okButtonText, cancelButtonText;
    switch ( currentLanguage ) {
        case "en":
            okButtonText = "Ok";
            cancelButtonText = "Cancel";
            break;
        case "de":
            // >>Not sure how to handle umlauts here, since it is not HTML<<
            okButtonText = "Bestätigen";
            cancelButtonText = "Abbrechen";
            break;
    }
    // Set the text message of the dialog.
    $( "#dialogDiv" ).html( text + (withInput ? "<br><input type=\"text\" id=\"dialogInput\">" : "")  );
    // Create a new dialog.
    $( "#dialogDiv" ).dialog({
    	resizable: false,
    	height: "auto",
    	width: "auto",
    	minWidth: 200,
    	minHeight: 150,
    	modal: true,
    	title: title,
    	close: function () {
    		$( "#dialogDiv" ).html( "" );
    	},
    	buttons : [
            {
                text: okButtonText,
                click: okFunction
		    },
            {
                text: cancelButtonText,
                click: function() {
                    $( this ).dialog( "close" );
                }
		    }
        ]
    });
}

/**
 * This function creates a new budget. It opens a dialog in which the user types
 * in a name for the new budget.
 */
function addBudget() {
    // Find out which language is selected to set the correct text.
    var currentLanguage = readPreference( "language" );
    var title, text;
    switch ( currentLanguage ) {
        case "en":
            title = "Add budget";
            text = "Type in the name of the new budget.";
            break;
        case "de":
            // This is no HTML, how to handle umlauts???
            title = "Konto hinzufügen";
            text = "Geben Sie einen Namen f&uuml;r das neue Konto ein.";
            break;
    }
    createDialog( title, text, true, function() {
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
    // Find out which language is selected to set the correct text.
    var currentLanguage = readPreference( "language" );
    var title, text;
    switch ( currentLanguage ) {
        case "en":
            title = "Delete budget";
            text = "Are you sure you want to delete " + name + "?";
            break;
        case "de":
            // This is no HTML, how to handle umlauts???
            title = "Konto löschen";
            text = "Wollen Sie " + name + " wirklich l&ouml;schen?";
            break;
    }
    createDialog( title, text, false, function() {
        // Get all currently available budgets.
        var currentBudgets = readMainStorage( "budgets" );
        // Delete the budget in all time earnings/spendings as well.
        var allTimeEarnings = readMainStorage( "allTimeEarnings" );
        var allTimeSpendings = readMainStorage( "allTimeSpendings" );
        // We add all budgets except the one we want to delete.
        var updatedBudgets = [], updatedAllTimeEarnings = [], updatedAllTimeSpendings = [];
        // Search for the correct budget to delete it.
        // (Note that all arrays have the same length)
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
        }
        // Save the updated budgets in the mainStorage.json file.
        writeMainStorage( "budgets", updatedBudgets );
        // Again, we do this as well for allTimeEarnings and allTimeSpendings.
        writeMainStorage( "allTimeEarnings", updatedAllTimeEarnings );
        writeMainStorage( "allTimeSpendings", updatedAllTimeSpendings );
        // Update the view: Don't display the deleted budget anymore.
        updateView();
        // Close the dialog (since this function is only executed when the OK button is pressed)
        $( this ).dialog( "close" );
    });
}

/**
 * This function renames a budget.
 * @param {String} name The name of the budget we want to change.
 */
function renameBudget( name ) {
    // Find out which language is selected to set the correct text.
    var currentLanguage = readPreference( "language" );
    var title, text;
    switch ( currentLanguage ) {
        case "en":
            title = "Rename budget";
            text = "Type in a new name for " + name + ".";
            break;
        case "de":
            title = "Konto umbenennen";
            text = "Geben Sie einen neuen Namen f&uuml;r " + name + " ein.";
            break;
    }
    createDialog( title, text, true, function() {
        // Get all currently available budgets.
        var currentBudgets = readMainStorage( "budgets" );
        // Rename the budget in all time earnings/spendings as well.
        var allTimeEarnings = readMainStorage( "allTimeEarnings" );
        var allTimeSpendings = readMainStorage( "allTimeSpendings" );
        // We add all budgets to this (and the renamed one with its new name)
        var updatedBudgets = [], updatedAllTimeEarnings = [], updatedAllTimeSpendings = [];
        var newName = $( "#dialogInput" ).val().trim();
        // Iterate over them to find the one we want to rename.
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
            if ( allTimeEarnings[i][0] === name ) updatedAllTimeEarnings.push( [newName, allTimeEarnings[i][1]] );
            else updatedAllTimeEarnings.push( allTimeEarnings[i] );
            if ( allTimeSpendings[i][0] === name ) updatedAllTimeSpendings.push( [newName, allTimeSpendings[i][1]] );
            else updatedAllTimeSpendings.push( allTimeSpendings[i] );
        }
        // Save the updated budgets in the mainStorage.json file.
        writeMainStorage( "budgets", updatedBudgets );
        // Again, we do this as well for allTimeEarnings and allTimeSpendings.
        writeMainStorage( "allTimeEarnings", updatedAllTimeEarnings );
        writeMainStorage( "allTimeSpendings", updatedAllTimeSpendings );
        // Update the view: Display the new name.
        updateView();
        // Close the dialog (since this function is only executed when the OK button is pressed)
        $( this ).dialog( "close" );
    });
}

/**
 * This function displays all currently available budgets.
 */
function displayBudgets() {
    // Reset previous content.
    var currentLanguage = readPreference( "language" );
    switch ( currentLanguage ) {
        case "en":
            $( "#currentBudgets" ).html( "<li><h6> Current budgets </h6></li>" );
            break;
        case "de":
            $( "#currentBudgets" ).html( "<li><h6> Aktuelle Konten </h6></li>" );
            break;
    }
    // Get all budgets to iterate over them.
    var currentBudgets = readMainStorage( "budgets" );
    // Iterate over all budgets to display them.
    for ( var i = 0; i < currentBudgets.length; i++ ) {
        // Display all budgets. The first one is a standard budget and can therefore not be deleted.
        // Note that currentBudgets is an array of arrays (name of the budget and its current balance).
        if ( i == 0 ) {
            $( "#currentBudgets" ).append( "<li class=\"w3-hover-light-blue w3-display-container\">" + currentBudgets[i][0] +
            "<span onclick=\"renameBudget('" + currentBudgets[i][0] + "');\" class=\"w3-button w3-display-right\">" +
            "<i style=\"padding-right:40px;\" class=\"fas fa-edit\"></i></span></li>" );
        }
        // Every other budget (not default) can be deleted.
        else {
            $( "#currentBudgets" ).append( "<li class=\"w3-hover-light-blue w3-display-container\">" + currentBudgets[i][0] +
                            "<span onclick=\"renameBudget('" + currentBudgets[i][0] + "');\" class=\"w3-button w3-display-right\">" +
                            "<i style=\"padding-right:40px\" class=\"fas fa-edit\"></i></span>" +
                            "<span onclick=\"deleteBudget('" + currentBudgets[i][0] + "');\" class=\"w3-button w3-display-right\">" +
                            "<i class=\"fas fa-times\"></i></span></li>" );
        }
    }
}

/**
 * This function displays every available budget in detail.
 */
function displayContent() {
    // Reset previous content.
    $( "#mainContent" ).html( "" );
    // Find out which button text should be displayed.
    var addSpendingButtonText, addEarningButtonText;
    var currentLanguage = readPreference( "language" );
    switch ( currentLanguage ) {
        case "en":
            addSpendingButtonText = "Add expenditure to this budget";
            addEarningButtonText = "Add earning to this budget";
            break;
        case "de":
            addSpendingButtonText = "Ausgabe zu diesem Konto hinzuf&uuml;gen";
            addEarningButtonText = "Einnahme zu diesem Konto hinzuf&uuml;gen";
            break;
    }
    // Get the currently selected currency to display it later on.
    var currentCurrency = readPreference( "currency" );
    var currencySign;
    switch ( currentCurrency ) {
        case "Euro":
            currencySign = "&euro;";
            break;
        case "Dollar":
            currencySign = "&dollar;";
            break;
        case "Pound":
            currencySign = "&pound;";
            break;
    }
    // Get all budgets to iterate over them.
    var currentBudgets = readMainStorage( "budgets" );
    // Display a detailed overview for every budget.
    for ( var i = 0; i < currentBudgets.length; i++ ) {
        // Create a new div and a seperation line.
        $( "#mainContent" ).append( "<br><hr style=\"border-color:black;\"><div class=\"w3-container\">" );
        // Display the name of the budget.
        $( "#mainContent" ).append( "<h5><i class=\"fa fa-arrow-right\"></i> " + currentBudgets[i][0] + " </h5>" );
        // Find out the sum of earnings in this month, so we can get an overview how much money is left.
        var quest = { connector:'or', params:[['budget', currentBudgets[i][0]]] };
        var dataObj = getData( getCurrentFileName(), quest );
        var totalEarningsThisMonth = 0;
        for ( var j = 0; j < dataObj.length; j++ ) {
            if ( dataObj[j].type === "earning" ) {
                totalEarningsThisMonth += dataObj[j].amount;
            }
        }
        // Calculate the percentage of how much money is left to adjust the progress bar.
        var percentage = 100;
        if ( totalEarningsThisMonth > 0 ) percentage = (currentBudgets[i][1] / totalEarningsThisMonth) * 100;
        // Select the color of the progress bar in dependency of the percentage value.
        var color;
        if ( percentage > 66 ) color = "green";
        else if ( percentage > 33 ) color = "orange";
        else color = "red";

        //TODO: When clicking on one of the buttons, open a dialog to type in a name and an amount for the spending/earning,
        // maybe a checkbox to decide if the transaction should be automated ervery month, select a day for each month in a dropdown menu,
        // display currently recurring transaction in a table like the budget overview table

        // Display the current balance.
        $( "#mainContent" ).append( "<div class=\"w3-grey\">" +
                                    "<div class=\"w3-center w3-" + color + "\" style=\"width:" + percentage + "%;\">" + currentBudgets[i][1] + currencySign + "</div></div>" );
        // Display button to add new spendings.
        $( "#mainContent" ).append( "<br><button class=\"w3-button w3-white w3-round-xlarge\" onclick=\"addSpending( 'auto', 10, '" + currentBudgets[i][0] + "' );\">" + addSpendingButtonText + "</button>" );
        // Display button to add new earnings
        $( "#mainContent" ).append( "<button class=\"w3-button w3-white w3-round-xlarge\" onclick=\"addEarning( 'auto', 10, '" + currentBudgets[i][0] + "' );\">" + addEarningButtonText + "</button></div><br>" );
    }
}

/**
 * This function updates the view when changes are made.
 */
function updateView() {
    // Display a list of currently available budgets.
    displayBudgets();
    // Display the budgets in detail.
    displayContent();
}
