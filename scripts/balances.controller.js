/**
 * This function initializes the page when its loaded. This means it sets the
 * language and some of the content.
 */
function loadPage() {
    // We will always set the language first.
    setLanguage();
    // Display a list of currently available budgets.
    displayBudgets();
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
    $( "#dialogDiv" ).html( text + withInput ? "<br><input type=\"text\" id=\"dialogInput\">" : "" );
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

    console.log("delete " + name);
}

/**
 * This function renames a budget.
 * @param {String} name The name of the budget we want to change.
 */
function renameBudget( name ) {
    console.log("rename " + name);
}

/**
 * This function displays all currently available budgets.
 */
function displayBudgets() {
    // Reset previous content.
    var currentLanguage = readPreference( "language" );
    if ( currentLanguage === "en" ) {
        $( "#currentBudgets" ).html( "<li><h6> Current budgets </h6></li>" );
    }
    else if ( currentLanguage === "de" ) {
        $( "#currentBudgets" ).html( "<li><h6> Aktuelle Konten </h6></li>" );
    }
    // Save all budgets to iterate over them.
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
 * This function
 */
function displayContent() {

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
