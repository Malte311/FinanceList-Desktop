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
 * This function displays the controls for the main content. (All the paramters which
 * can be chosen by the user to filter the data)
 */
function displayContentControls() {
    // First, get all budgets to offer a selection between them.
    var currentBudgets = readMainStorage( "budgets" );
    // We will add all the content to this and then display it in the dialog.
    var budgetOptions = "";
    // Display an option for every available budget, so the user can select any budget.
    for ( var i = 0; i < currentBudgets.length; i++ ) {
        budgetOptions += "<option value=\"" + currentBudgets[i][0] + "\">" + currentBudgets[i][0] + "</option>";
    }
    // Set the content (and reset previous content).
    $( "#mainContentControls" ).html(
        // Display a selection for display types (graph/table).
        "<form class=\"w3-center\">" +
            "<input id=\"graph\" onclick=\"displayContent('graph');\" type=\"radio\" name=\"type\" checked>" +
            getDisplayTypeTextElements()[0] +
            "<input id=\"table\" onclick=\"displayContent('table');\" style=\"margin-left:15px;\" type=\"radio\" name=\"type\">" +
            getDisplayTypeTextElements()[1] +
        "</form><hr>" +
        // Display filters for the user so they can choose which data they want to see.
        "<div>" +
            "<table align=\"center\">" +
                "<tr>" +
                    "<td><select class=\"w3-select\" id=\"nameSelect\">" +
                        "<option selected=\"selected\">" + getMainContentFilterText()[0] + "</option>" +
                    "</select></td>" +
                    "<td><select class=\"w3-select\" id=\"budgetSelect\">" +
                        "<option selected=\"selected\">" + getMainContentFilterText()[1] + "</option>" + budgetOptions +
                    "</select></td>" +
                    "<td><select class=\"w3-select\" id=\"typeSelect\">" +
                        "<option selected=\"selected\">" + getMainContentFilterText()[2] + "</option>" +
                        "<option>" + getMainContentFilterText()[3] + "</option>" +
                        "<option>" + getMainContentFilterText()[4] + "</option>" +
                    "</select></td>" +
                    "<td><select class=\"w3-select\" id=\"dateSelect\">" +
                        "<option selected=\"selected\">" + getMainContentFilterText()[5] + "</option>" +
                    "</select></td>" +
                    "<td><select class=\"w3-select\" id=\"amountSelect\">" +
                        "<option selected=\"selected\">" + getMainContentFilterText()[6] + "</option>" +
                    "</select></td>" +
                    "<td><select class=\"w3-select\" id=\"categorySelect\">" +
                        "<option selected=\"selected\">" + getMainContentFilterText()[7] + "</option>" +
                    "</select></td>" +
                    "<td><button class=\"w3-button w3-white w3-round-xlarge\" onclick=\"\">" + getMainContentStartButtonText() + "</button></td>" +
                "</tr>" +
            "</table>" +
        "</div>" );
}

/**
 * This function displays the details the user wishes to see.
 * @param {String} displayType This indicates how the data will be displayed (table/graph).
 */
function displayContent( displayType ) {
    // Display the real content.
    // Display a graph?
    if ( displayType === "graph" ) {
        // Create a canvas for our chart.
        $( "#mainContent" ).html( "<br><canvas id=\"graphCanvas\"></canvas>" );

        // TODO find out which data the user wants to see => apply filter and display the chart
        createChart( $( "#graphCanvas" )[0], ["a","b"], [1,2], colors, colors, readPreference( "chartType" ) );
    }
    // Display a table?
    else if ( displayType === "table" ) {
        // Create the headings for the table.
        var tableHeadingsText = getMainContentTableHeadings();
        var tableHeadingsHTML = "";
        for ( var i = 0; i < tableHeadingsText.length; i++ ) {
            tableHeadingsHTML += "<td><b>" + tableHeadingsText[i] + "</b></td>";
        }
        // Get all files, to search for the data.
        var allFiles = getJSONFiles();
        // Find out, which data is wanted.


        // TODO find out which data the user wants to see => apply filter
        var parameter = [["type", "earning"],["type", "spending"]];
        var quest = { connector : "or", params : parameter };


        // Get the content for the table.
        var tableContentHTML = "";
        for ( var i = 0; i < allFiles.length; i++ ) {
            // Get the data for the current file.
            var transactions = getData( allFiles[i] + ".json", quest );
            // Now, save all the data from this file.
            for ( var j = 0; j < transactions.length; j++ ) {
                // Add the data to our table.
                tableContentHTML += "<tr class=\"w3-hover-light-blue\"><td>" + transactions[j].date + "</td>" +
                                    "<td>" + transactions[j].name + "</td>" +
                                    "<td>" + transactions[j].amount + getCurrencySign() + "</td>" +
                                    "<td>" + transactions[j].category + "</td>" +
                                    "<td>" + transactions[j].budget + "</td>" +
                                    "<td>" + getType( transactions[j].type ) + "</td></tr>";
            }
        }
        // Display the table containing the data.
        $( "#mainContent" ).html( "<br><table class=\"w3-table-all w3-round\">" +
                                  "<tr>" + tableHeadingsHTML + "</tr>" +
                                  tableContentHTML + "</table>" );
    }
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
 * This function displays the jQuery UI Datepicker.
 */
function showDatepicker() {
    $( "#datepicker" ).datepicker({
        dateFormat: "dd.mm.yy",
    });
    $( "#datepicker" ).datepicker("show");
}

/**
 * This function updates the view when changes are made.
 */
function updateView() {
    // Display a list of currently available budgets.
    displayBudgets();
    // Display the budgets in detail.
    displayContentControls();
    displayContent( "graph" );
    // Display a list of currently recurring transactions.
    displayRecurringTransactions();
}
