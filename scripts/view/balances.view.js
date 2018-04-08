/**************************************************************************************************
 * This file is responsible for the view on the balances page.
**************************************************************************************************/

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
                  "<td>" + getCurrentBudgetsHeadings()[2] + "</td>" +
                  (readMainStorage( "allocationOn" ) ?
                  "<td>" + getCurrentBudgetsHeadings()[3] + "</td></tr>" :
                  "</tr>");
    // Get all budgets to iterate over them.
    var currentBudgets = readMainStorage( "budgets" );
    // Iterate over all budgets to display them.
    for ( var i = 0; i < currentBudgets.length; i++ ) {
        // Sometimes we want to add a single zero ($2.5 => $2.50).
        var balance = currentBudgets[i][1];
        // Balance contains a comma?
        if ( currentBudgets[i][1].toString().indexOf( "." ) !== -1 ) {
            // Only one decimal digit? Add a zero to the end.
            if ( currentBudgets[i][1].toString().split( "." )[1].length < 2 ) balance += "0";
        }
        // Display all budgets. The first one is a standard budget and can therefore not be deleted.
        // Note that currentBudgets is an array of arrays (name of the budget and its current balance).
        content += "<tr><td>" + currentBudgets[i][0] + "</td>" +
                   "<td>" + balance + getCurrencySign() + "</td>" +
                   "<td>" + "<span onclick=\"renameBudget('" + currentBudgets[i][0] + "');\" class=\"w3-button\">" +
                   "<i class=\"fas fa-edit\"></i></span>";
        // Every other budget (not default) can be deleted.
        if ( i !== 0 ) {
            content += "<span onclick=\"deleteBudget('" + currentBudgets[i][0] + "');\" class=\"w3-button\"><i class=\"fas fa-times w3-text-red\"></i></span></li>";
        }
        content += "</td>";
        // Allocation enabled? Display the ratios.
        // Note: Allocation has the same order as budgets, so we can use the same index.
        if ( readMainStorage( "allocationOn" ) ) {
            content += "<td>" + readMainStorage( "allocation" )[i][1] + "&percnt;</td>";
        }
        content += "</tr>";
    }
    content += "</table><br>";
    // Display the content.
    $( "#currentBudgets" ).html( content );
}

/**
 * This function displays all currently recurring transactions.
 */
function displayRecurringTransactions() {
    // Get all recurring transactions.
    var recurringTransactions = readMainStorage( "recurring" );
    // Recurring transactions existing?
    if ( recurringTransactions.length > 0 ) {
        // Reset previous content.
        var content = "<table class=\"w3-table-all w3-round w3-twothird\"><tr>" +
                      "<td>" + getRecurringTransactionsHeadings()[0] + "</td>" +
                      "<td>" + getRecurringTransactionsHeadings()[1] + "</td>" +
                      "<td>" + getRecurringTransactionsHeadings()[2] + "</td>" +
                      "<td>" + getRecurringTransactionsHeadings()[3] + "</td>" +
                      "<td>" + getRecurringTransactionsHeadings()[4] + "</td>" +
                      "<td>" + getRecurringTransactionsHeadings()[5] + "</td>" +
                      "<td>" + getRecurringTransactionsHeadings()[6] + "</td>" +
                      "</tr>";
        // Iterate over all recurring transactions to display them.
        for ( var i = 0; i < recurringTransactions.length; i++ ) {
            // Sometimes we want to add a single zero (2.5 => 2.50) for a more beautiful display style.
            var amount = recurringTransactions[i].amount;
            if ( recurringTransactions[i].amount.toString().indexOf( "." ) !== -1 ) {
                if ( recurringTransactions[i].amount.toString().split( "." )[1].length < 2 ) amount += "0";
            }
            // Set the type in dependecy of the current language.
            var type = ( recurringTransactions[i].type === "earning" ? getRecurringTransactionsContent()[0] : getRecurringTransactionsContent()[1] );
            // Add all the data to our content.
            content += "<tr><td>" + recurringTransactions[i].name + "</td>" +
                       "<td>" + amount + getCurrencySign() + "</td>" +
                       "<td>" + type + "</td>" +
                       "<td>" + (recurringTransactions[i].allocationOn ? "&mdash;" : recurringTransactions[i].budget) + "</td>" +
                       // If a category exists, display it. Otherwise display "-".
                       "<td>" + (recurringTransactions[i].category.length > 0 ? recurringTransactions[i].category : "&mdash;") + "</td>" +
                       "<td>" + recurringTransactions[i].date + "</td>" +
                       "<td><span onclick=\"deleteRecurringTransaction('" + recurringTransactions[i].name + "')\" class=\"w3-button\"><i class=\"fas fa-times w3-text-red\"></i></span></td>" +
                       "</tr>";
        }
        content += "</table><br>";
        // Set the new content.
        $( "#recurringTransactions" ).html( content );
    }
    // No recurring transactions:
    else {
        $( "#recurringTransactions" ).html( "<i>" + getRecurringTransactionsContent()[3] + "</i>" );
    }
}

/**
 * This function displays every available budget in detail.
 */
function displayContent() {
    // Reset previous content.
    $( "#mainContent" ).html( "" );

    //TODO: select a day for each month in a dropdown menu, display currently recurring transaction in a table like the budget overview table
}

/**
 * This function changes the content of the transaction dialog dynamically.
 */
function updateTransactionDialog() {
    // Earning selected?
    if ( $( "#earning" )[0].checked ) {
        // Allocation on?
        if ( readMainStorage( "allocationOn" ) ) {
            // Show the allocation option.
            $( "#dynamicDiv1" ).show();
            // If allocation is selected, don't show budget select.
            if ( $( "#autoAllocation" )[0].checked ) {
                $( "#dynamicDiv2" ).hide();
            }
            // Otherwise (manual budget select) show budget select.
            else if ( $( "#manual" )[0].checked ) {
                $( "#dynamicDiv2" ).show();
            }
        }
        // Allocation is not activated.
        else {
            // Hide automatic allocation and show budget select.
            $( "#dynamicDiv1" ).hide();
            $( "#dynamicDiv2" ).show();
        }
    }
    // Spending selected?
    else if ( $( "#spending" )[0].checked ) {
        // Hide automatic allocation and show budget select.
        $( "#dynamicDiv1" ).hide();
        $( "#dynamicDiv2" ).show();
    }
    // Check for automation.
    // Automation activated:
    if ( $( "#checkboxInput" )[0].checked ) {
        $( "#dynamicDiv3" ).show();
    }
    // No automation activated:
    else {
        $( "#dynamicDiv3" ).hide();
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
    // Display a list of currently recurring transactions.
    displayRecurringTransactions();
}
