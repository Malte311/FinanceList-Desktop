/**
 * This function creates dialogues for adding, renaming and deleting budgets.
 * @param {String} title The title of the dialog.
 * @param {String} text The content of the dialog.
 * @param {function} okFunction A function to be executed when the OK button was pressed.
 */
function createDialog( title, text, okFunction ) {
    // Set the content of the dialog.
    $( "#dialogDiv" ).html( text );
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
                text: getConfirmButtonText(),
                click: okFunction
		    },
            {
                text: getCancelButtonText(),
                click: function() {
                    $( this ).dialog( "close" );
                }
		    }
        ]
    });
}

/**
 * This function displays all currently available budgets in a simple overview.
 */
function displayBudgets() {
    // Reset previous content, set the table heading.
    var content = "<table class=\"w3-table-all w3-round w3-twothird\">" +
                  "<tr><td>" + getCurrentBudgetsHeadings()[0] + "</td>" +
                  "<td>" + getCurrentBudgetsHeadings()[1] + "</td>" +
                  "<td>" + getCurrentBudgetsHeadings()[2] + "</td></tr>";
    // Get all budgets to iterate over them.
    var currentBudgets = readMainStorage( "budgets" );
    // Iterate over all budgets to display them.
    for ( var i = 0; i < currentBudgets.length; i++ ) {
        // Display all budgets. The first one is a standard budget and can therefore not be deleted.
        // Note that currentBudgets is an array of arrays (name of the budget and its current balance).
        content += "<tr><td>" + currentBudgets[i][0] + "</td>" +
                   "<td>" + currentBudgets[i][1] + getCurrencySign() + "</td>" +
                   "<td>" + "<span onclick=\"renameBudget('" + currentBudgets[i][0] + "');\" class=\"w3-button\">" +
                   "<i class=\"fas fa-edit\"></i></span>";
        // Every other budget (not default) can be deleted.
        if ( i !== 0 ) {
            content += "<span onclick=\"deleteBudget('" + currentBudgets[i][0] + "');\" class=\"w3-button\"><i class=\"fas fa-times\"></i></span></li>";
        }
        content += "</td></tr>";
    }
    content += "</table><br>";
    // Display the content.
    $( "#currentBudgets" ).html( content );
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
    // Get all budgets to iterate over them.
    var currentBudgets = readMainStorage( "budgets" );
    // Display a detailed overview for every budget.
    for ( var i = 0; i < currentBudgets.length; i++ ) {
        // Create a new div and a seperation line.
        $( "#mainContent" ).append( "<hr style=\"border-color:black;\"><div class=\"w3-container\">" );
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
                                    "<div class=\"w3-center w3-" + color + "\" style=\"width:" + percentage + "%;\">" + currentBudgets[i][1] + getCurrencySign() + "</div></div>" );
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
