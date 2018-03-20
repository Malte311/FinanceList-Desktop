/**
 * This function creates dialogues for adding, renaming and deleting budgets.
 * @param {String} title The title of the dialog.
 * @param {String} text The text message of the dialog.
 * @param {bool} withInput This indicates if the dialog has an input field or not.
 * @param {function} okFunction A function to be executed when the OK button was pressed.
 */
function createBudgetDialog( title, text, withInput, okFunction ) {
    // Find out which language is selected to set the text elements of the dialog.
    var currentLanguage = readPreference( "language" );
    var okButtonText, cancelButtonText;
    switch ( currentLanguage ) {
        case "en":
            okButtonText = "Ok";
            cancelButtonText = "Cancel";
            break;
        case "de":
            okButtonText = "Bestätigen";
            cancelButtonText = "Abbrechen";
            break;
    }
    // Set the text message of the dialog.
    $( "#dialogDiv" ).html( text + (withInput ? "<br><input type=\"text\" id=\"dialogInput\">" : "") );
    // Create a new dialog.
    $( "#dialogDiv" ).dialog({
    	resizable: false,
    	height: "auto",
    	width: "auto",
    	minWidth: 200,
    	minHeight: 150,
    	modal: true,
    	title: title,
        // Reset the text on close.
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
 * This function creates dialogues for adding transactions.
 */
function createTransactionDialog() {
    // Find out which language is selected to set the text elements of the dialog.
    var currentLanguage = readPreference( "language" );
    var title, text, okButtonText, cancelButtonText;
    switch ( currentLanguage ) {
        case "en":
            title = "Add transaction";
            text = ["Earning", "Spending", "Amount", "Budget", "Automate"];
            okButtonText = "Ok";
            cancelButtonText = "Cancel";
            break;
        case "de":
            title = "Eintrag hinzufügen";
            text = ["Einnahme", "Ausgabe", "Betrag", "Konto", "Automatisieren"];
            okButtonText = "Bestätigen";
            cancelButtonText = "Abbrechen";
            break;
    }
    // Set the text message of the dialog.
    var currentBudgets = readMainStorage( "budgets" );
    var currentBudgetsHTML = "";
    // We want to display all available budgets.
    for ( var i = 0; i < currentBudgets.length; i++ ) {
        currentBudgetsHTML += "<option value=\"" + currentBudgets[i][0] + "\">" + currentBudgets[i][0] + "</option>";
    }
    $( "#dialogDiv" ).html( "<form class=\"w3-center\"><input id=\"earning\" type=\"radio\" name=\"type\">" + text[0] +
                            "<input id=\"spending\" style=\"margin-left:15px;\" type=\"radio\" name=\"type\" checked>" + text[1] + "</form><hr>" +
                            "<b>Name</b><br><input type=\"text\" id=\"nameInput\"><br><hr>" +
                            "<b>" + text[2] + "</b><br><input style=\"width=50px;\" type=\"text\" id=\"sumInput\"><br><hr>" +
                            "<b>" + text[3] + "</b><br>" +
                            "<select id=\"selectInput\">" + currentBudgetsHTML + "</select><hr><input type=\"checkbox\" id=\"checkboxInput\">" + text[4] );
    // Create a new dialog.
    $( "#dialogDiv" ).dialog({
    	resizable: false,
    	height: "auto",
    	width: "auto",
    	minWidth: 200,
    	minHeight: 150,
    	modal: true,
    	title: title,
        // Reset the text on close.
    	close: function () {
    		$( "#dialogDiv" ).html( "" );
    	},
    	buttons : [
            {
                text: okButtonText,
                click: function() {
                    // Save the inputs and then execute the right function to add a new entry.
                    var name = $( "#nameInput" ).val().trim();
                    var sum = $( "#sumInput" ).val().trim();
                    // Replace all commas with dots to make sure that parseFloat() works as intended.
                    sum.replace( ",", "." );
                    // Make sure that the input is ok.
                    var inputOk = true;
                    // Make sure that the name is not empty and that it contains only alphanumeric characters.
                    if ( name.length < 1 || !/^[a-z0-9]+$/i.test( name ) ) inputOk = false;
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
                        // More than two decimal digits in the sum? Truncate them.
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
                        var budgetSelect = document.getElementById( "selectInput" );
                        var budget = budgetSelect.options[budgetSelect.selectedIndex].text;
                        // Find out which type (earning/spending) was selected and
                        // execute the correct function.
                        if ( document.getElementById( "earning" ).checked ) {
                            addEarning( name, parseFloat( sum ), budget );
                        }
                        else if ( document.getElementById( "spending" ).checked ) {
                            addSpending( name, parseFloat( sum ), budget );
                        }
                    }
                    // Wrong input: Show error message.
                    else {
                        dialog.showErrorBox( "Error", "Invalid input." );
                    }
                    // Close the dialog and update the view.
                    $( this ).dialog( "close" );
                    updateView();
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
}

/**
 * This function opens a dialog in which the user can access allocation settings.
 */
function createBudgetSettingsDialog() {
    // Find out which language is selected to set the text elements of the dialog.
    var currentLanguage = readPreference( "language" );
    var title, text, okButtonText, cancelButtonText;
    switch ( currentLanguage ) {
        case "en":
            title = "Allocation settings";
            text = ["Here you can select how your earnings should be distributed.", "Budget", "Percentage"];
            okButtonText = "Ok";
            cancelButtonText = "Cancel";
            break;
        case "de":
            title = "Budgetverwaltung";
            text = ["Hier k&ouml;nnen Sie ausw&auml;hlen, wie Ihre Einnahmen verteilt werden sollen.", "Konto", "Anteil"];
            okButtonText = "Bestätigen";
            cancelButtonText = "Abbrechen";
            break;
    }
    // We want to display all budgets and their allocations.
    var currentAllocation = readMainStorage( "allocation" );
    var currentBudgets = readMainStorage( "budgets" );
    var currentBudgetsHTML = "";
    for ( var i = 0; i < currentBudgets.length; i++ ) {
        // Display currently selected value as selected.
        // Note: The allocation array has same length as the budgets array.
        // Additionally, the indizes are corresponding, so we don't need further checking.
        // (Obviously, this is only true if nobody manipulated the .json file)
        var currentAllocationHTML = "";
        for ( var j = 1; j <= 10; j++ ) {
            if ( j * 10 === currentAllocation[i][1] ) {
                currentAllocationHTML += "<option value=\"" + currentAllocation[i][1] + "\" selected=\"selected\">" + currentAllocation[i][1] + "</option>";
            }
            else {
                currentAllocationHTML += "<option value=\"" + (j * 10).toString() + "\">" + (j * 10).toString() + "</option>";
            }
        }

        currentBudgetsHTML += "<tr class=\"w3-hover-light-blue\"><td>" + currentBudgets[i][0] + "</td><td><select class=\"w3-select\" id=\"percentageSelect" + currentBudgets[i][0] + "\">" + currentAllocationHTML + "</select></td></tr>";
    }

    $( "#dialogDiv" ).html( text[0] + "<br><hr><table class=\"w3-table-all\"><tr><th>" + text[1] + "</th><th>" + text[2] + "</th>" + currentBudgetsHTML + "</tr>" + "</table>" );
    // Create a new dialog.
    $( "#dialogDiv" ).dialog({
    	resizable: false,
    	height: "auto",
    	width: "auto",
    	minWidth: 200,
    	minHeight: 150,
    	modal: true,
    	title: title,
        // Reset the text on close.
    	close: function () {
    		$( "#dialogDiv" ).html( "" );
    	},
    	buttons : [
            {
                text: okButtonText,
                click: function() {
                    var test = document.getElementById( "percentageSelectchecking account" );
                    console.log( test.options[test.selectedIndex].text );
                    console.log( $("#percentageSelectchecking account").val() );
                    // Close the dialog and update the view.
                    $( this ).dialog( "close" );
                    updateView();
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
        $( "#mainContent" ).append( "<h5><i class=\"fa fa-arrow-right w3-text-green w3-large\"></i> " + currentBudgets[i][0] + " </h5>" );
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
        var color;
        // Check if balance is negative.
        if ( currentBudgets[i][1] >= 0 ) {
            if ( totalEarningsThisMonth > 0 ) percentage = (currentBudgets[i][1] / totalEarningsThisMonth) * 100;
            // Select the color of the progress bar in dependency of the percentage value.
            if ( percentage > 66 ) color = "green";
            else if ( percentage > 33 ) color = "orange";
            else color = "red";
        }
        // Balance negative: Red color, percentage still at 100 (so the complete bar is red).
        else {
            color = "red";
        }

        //TODO: select a day for each month in a dropdown menu, display currently recurring transaction in a table like the budget overview table

        // Display the current balance.
        $( "#mainContent" ).append( "<div class=\"w3-grey\">" +
                                    "<div class=\"w3-center w3-" + color + "\" style=\"width:" + percentage + "%;\">" + currentBudgets[i][1] + currencySign + "</div></div>" );
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
