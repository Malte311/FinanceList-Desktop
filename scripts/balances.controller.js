/**
 * This function initializes the page when its loaded. This means it sets the
 * language and some of the content.
 */
function loadPage() {
    setLanguage();
    displayBudgets();
}

/**
 * This function saves new spending entries in json files.
 * @param {String} spending The name of the spending.
 * @param {double} sum The cost of the aquired thing.
 * @param {String} budget The budget from which the sum should be subtracted.
 */
function addSpending( spending, sum, budget ) {
    // Create a JSON object containing the data.
    var spendingObj = {"date": getCurrentDate(), "name": spending, "amount": sum, "budget": budget, "type": "spending"};
    // Now store the data in the corresponding json file.
    storeData( spendingObj );
}

/**
 * This function saves new earnings entries in json files.
 * @param {String} earning The name of the earning.
 * @param {double} sum The amount of the earning.
 * @param {String} budget The budget to which the sum should be added.
 */
function addEarning( earning, sum, budget ) {
    // Create a JSON object containing the data.
    var spendingObj = {"date": getCurrentDate(), "name": earning, "amount": sum, "budget": budget, "type": "earning"};
    // Now store the data in the corresponding json file.
    storeData( spendingObj );
}

/**
 * This function displays all currently available budgets.
 */
function displayBudgets() {
    // Reset previous content.
    var currentLanguage = readPreference( "language" );
    if ( currentLanguage === "en" ) $( "#currentBudgets" ).html( "<li><h6> Current budgets </h6></li>" );
    else if ( currentLanguage === "de" ) $( "#currentBudgets" ).html( "<li><h6> Aktuelle Konten </h6></li>" );
    // Get the mainStorage.json object.
    var mainStorageObj = JSON.parse( fs.readFileSync( readPreference( "path" ) + "/mainStorage.json" ) );
    // Iterate over all budgets to display them.
    for ( var i = 0; i < mainStorageObj["budgets"].length; i++ ) {
        // Display all budgets. The first one is a standard budget and can therefore not be deleted.
        if ( i == 0 ) $( "#currentBudgets" ).append( "<li class=\"w3-hover-light-blue w3-display-container\">" + mainStorageObj["budgets"][i][0] + "</li>" );


        // TODO: else condition is not correct
        else $( "#currentBudgets" ).append( "<li class=\"w3-hover-light-blue w3-display-container\">" + mainStorageObj["budgets"][i][0] + "</li>" );
    }
}

/**
 * This function creates a new budget. It opens a dialog in which the user types
 * in a name for the new budget.
 */
function addBudget() {
    // Find out which language is selected to set the text of the dialog.
    var currentLanguage = readPreference( "language" );
    var okButtonText;
    var cancelButtonText;
    var title;
    // Set the text elements in the dialog.
    if ( currentLanguage === "en" ) {
        $( "#dialogDiv" ).html( "Type in the name of the new budget." + "<br><input type=\"text\" id=\"dialogInput\">" );
        okButtonText = "Ok";
        cancelButtonText = "Cancel";
        title = "Adding a budget";
    }
    else if ( currentLanguage === "de" ) {
        // >>Not sure how to handle umlauts here<<
        $( "#dialogDiv" ).html( "Geben Sie einen Namen f&uuml;r das neue Konto ein." + "<br><input type=\"text\" id=\"dialogInput\">" );
        okButtonText = "Bestätigen";
        cancelButtonText = "Abbrechen";
        title = "Konto hinzufügen";
    }
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
                click: function() {
                    // Save the new budget and display it.
                    var dataPath = readPreference( "path" ) + "/mainStorage.json";
                    var mainStorageObj = JSON.parse( fs.readFileSync( dataPath ) );
                    var currentBudgets = [];
                    var newBudget = document.getElementById( "dialogInput" ).value.trim();
                    var alreadyExists = false;
                    for ( var i = 0; i < mainStorageObj.budgets.length; i++ ) {
                        currentBudgets.push( mainStorageObj.budgets[i] );
                        if ( mainStorageObj.budgets[i][0] === newBudget ) {
                            alreadyExists = true;
                            break;
                        }
                    }
                    // Only add a new budget if it does not already exist.
                    if ( !alreadyExists ) {
                        currentBudgets.push( [newBudget, 0.0] );
                        mainStorageObj.budgets = currentBudgets;
                        fs.writeFileSync( dataPath, JSON.stringify( mainStorageObj ) );
                        displayBudgets();
                    }
                    $( this ).dialog( "close" );
                }
		    },
            {
                text: cancelButtonText,
                click: function() {
                    $( this ).dialog( "close" );
                }
		    }
        ]
    });



    // TODO: Give this stuff a better structure.

    // Display it in the list of available budgets.
    var newBudget = "<li class=\"w3-hover-light-blue w3-display-container\">" + name +
                    "<span onclick=\"console.log('edit')\" class=\"w3-button w3-display-right\"><i style=\"padding-right:50px\" class=\"fas fa-edit\"></i></span>" +
                    "<span onclick=\"console.log('delete')\" class=\"w3-button w3-display-right\"><i style=\"width=25px; height=25px\" class=\"fas fa-times\"></i></span></li>"
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
