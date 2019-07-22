/**
 * This file is responsible for the view on the balances page.
 *
 * @author Malte311
 */

var textElements;

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
                text: textElements.confirm,
                click: okFunction
		    },
            {
                text: textElements.cancel,
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
    var content = "<table class=\"w3-table-all w3-round w3-twothird\">" + "<tr>" +
                  "<td><b>" + textElements.currentBudgetsHeadings[0] + "</b></td>" +
                  "<td><b>" + textElements.currentBudgetsHeadings[1] + "</b></td>" +
                  "<td><b>" + textElements.currentBudgetsHeadings[2] + "</b></td>" +
                  (readMainStorage( "allocationOn" ) ?
                  "<td><b>" + textElements.currentBudgetsHeadings[3] + "</b></td></tr>" :
                  "</tr>");
    // Get all budgets to iterate over them.
    var currentBudgets = readMainStorage( "budgets" );
    var overallBalance = 0;
    // Iterate over all budgets to display them.
    for ( var i = 0; i < currentBudgets.length; i++ ) {
        var balance = beautifyAmount( currentBudgets[i][1] );
        overallBalance += currentBudgets[i][1];
        // Display all budgets. The first one is a standard budget and can therefore not
        // be deleted. Note that currentBudgets is an array of arrays
        // (name of the budget and its current balance).
        content += "<tr class=\"w3-hover-light-blue\"><td>" + currentBudgets[i][0] + "</td>" +
                   "<td>" + balance + getCurrencySign() + "</td>" +
                   "<td>" + "<span onclick=\"renameBudget('" + currentBudgets[i][0] + "');\"" +
                   "class=\"w3-button\"><i class=\"fas fa-edit\"></i></span>";
        // Every other budget (not default) can be deleted.
        if ( i !== 0 ) {
            content += "<span onclick=\"deleteBudget('" + currentBudgets[i][0] + "');\"" +
                       "class=\"w3-button\"><i class=\"fas fa-times w3-text-red\"></i></span></li>";
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

    // Display the overall balance
    overallBalance = beautifyAmount( Math.round( overallBalance * 1e2 ) / 1e2 );
    $( "#overallBalance" ).html(
        "<br>" + textElements.overallBalance + ": " + overallBalance + getCurrencySign()
    );
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
                      "<td><b>" + textElements.recurringTransactionsHeadings[0] + "</b></td>" +
                      "<td><b>" + textElements.recurringTransactionsHeadings[1] + "</b></td>" +
                      "<td><b>" + textElements.recurringTransactionsHeadings[2] + "</b></td>" +
                      "<td><b>" + textElements.recurringTransactionsHeadings[3] + "</b></td>" +
                      "<td><b>" + textElements.recurringTransactionsHeadings[4] + "</b></td>" +
                      "<td><b>" + textElements.recurringTransactionsHeadings[5] + "</b></td>" +
                      "<td><b>" + textElements.recurringTransactionsHeadings[6] + "</b></td>" +
                      "<td><b>" + textElements.recurringTransactionsHeadings[7] + "</b></td>" +
                      "<td><b>" + textElements.recurringTransactionsHeadings[8] + "</b></td>" +
                      "<td><b>" + textElements.recurringTransactionsHeadings[9] + "</b></td>" +
                      "</tr>";
        // Iterate over all recurring transactions to display them.
        for ( var i = 0; i < recurringTransactions.length; i++ ) {
            var amount = beautifyAmount( recurringTransactions[i].amount );
            // Set the type in dependecy of the current language.
            var type = ( recurringTransactions[i].type === "earning" ?
                         textElements.recurringTransactionsContent[0] :
                         textElements.recurringTransactionsContent[1] );
            // Add all the data to our content.
            content += "<tr class=\"w3-hover-light-blue\"><td>" + recurringTransactions[i].name + "</td>" +
                       "<td>" + amount + getCurrencySign() + "</td>" +
                       "<td>" + type + "</td>" +
                       "<td>" + (recurringTransactions[i].allocationOn ?
                                 "&mdash;" :
                                 recurringTransactions[i].budget) + "</td>" +
                       // If a category exists, display it. Otherwise display "-".
                       "<td>" + (recurringTransactions[i].category.length > 0 ?
                                 recurringTransactions[i].category :
                                 "&mdash;") + "</td>" +
                       "<td>" + dateToString( recurringTransactions[i].nextDate ) + "</td>" +
                       "<td>" + textElements.intervalOptionsTextElements[recurringTransactions[i].interval] + "</td>" +
                       "<td>" + (recurringTransactions[i].endDate > 0 ?
                                 dateToString( recurringTransactions[i].endDate ) :
                                 "&mdash;") + "</td>" +
                       "<td><span onclick=\"deleteRecurringTransaction('" + recurringTransactions[i].name + "'," + i + ")\"" +
                       "class=\"w3-button\"><i class=\"fas fa-times w3-text-red\"></i></span></td>" +
                       "<td><span onclick=\"editRecurringTransaction('" + recurringTransactions[i].name + "'," + i + ")\"" +
                       "class=\"w3-button\"><i class=\"fas fa-edit\"></i></span></td>" +
                       "</tr>";
        }
        content += "</table><br>";
        // Set the new content.
        $( "#recurringTransactions" ).html( content );
    }
    // No recurring transactions:
    else {
        $( "#recurringTransactions" ).html( "<i>" + textElements.recurringTransactionsContent[3] + "</i>" );
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
        budgetOptions += "<option value=\"" + currentBudgets[i][0] + "\">" +
                                              currentBudgets[i][0] + "</option>";
    }
    // Set the content (and reset previous content).
    $( "#mainContentControls" ).html(
        // Display a selection for display types (graph/table).
        "<form class=\"w3-center\">" +
            "<input id=\"graph\" onclick=\"updateContent();\"" +
            "type=\"radio\" name=\"type\" checked>" +
            textElements.displayTypes[0] +
            "<input id=\"table\" onclick=\"updateContent();\" style=\"margin-left:15px;\"" +
            "type=\"radio\" name=\"type\">" +
            textElements.displayTypes[1] +
        "</form><hr>" +
        // Display filters for the user so they can choose which data they want to see.
        "<div>" +
            "<table align=\"center\">" +
                "<tr>" +
                    "<td>" +
                        "<select class=\"w3-select\" id=\"budgetSelect\">" +
                            "<option selected=\"selected\">" +
                                textElements.mainContentFilterText[0] +
                            "</option>" + budgetOptions +
                        "</select>" +
                    "</td>" +
                    "<td>" +
                        "<select class=\"w3-select\" id=\"typeSelect\">" +
                            "<option>" + textElements.mainContentFilterText[1] + "</option>" +
                            "<option>" + textElements.mainContentFilterText[2] + "</option>" +
                            "<option selected=\"selected\">" +
                                textElements.mainContentFilterText[3] +
                            "</option>" +
                        "</select>" +
                    "</td>" +
                    "<td>" +
                        "<input id=\"dateSelect\" class=\"w3-round-large w3-white\"" +
                        "onclick=\"showDatepicker('3');\">" +
                    "</td>" +
                    "<td>" +
                        "<input id=\"amountFrom\" type=\"text\" size=\"2\">" + getCurrencySign() +
                        " " + textElements.mainContentFilterText[5] + " " +
                        "<input id=\"amountTo\" type=\"text\" size=\"2\">" + getCurrencySign() +
                    "</td>" +
                    "<td>" +
                        "<input id=\"nameSelect\" type=\"text\" size=\"15\" placeholder=\"" +
                        textElements.mainContentFilterText[6] + "\">" +
                    "</td>" +
                    "<td>" +
                        "<input id=\"categorySelect\" type=\"text\" size=\"15\" placeholder=\"" +
                        textElements.mainContentFilterText[7] + "\">" +
                    "</td>" +
                    "<td>" +
                        "<button class=\"w3-button w3-white w3-round-xlarge\"" +
                        "onclick=\"updateContent();\">" + textElements.update + "</button>" +
                    "</td>" +
                "</tr>" +
            "</table>" +
        "</div>" );
    // Activate the datepicker.
    activateDateRangePicker( "#dateSelect" );
    // Autocomplete for user inputs.
    $( "#nameSelect" ).autocomplete({
      source: readMainStorage( "availableNames" )
    });
    $( "#categorySelect" ).autocomplete({
      source: readMainStorage( "availableCategories" )
    });
}

/**
 * This function displays the details the user wishes to see.
 * @param {String} displayType This indicates how the data will be displayed (table/graph).
 * The following are filters for the data.
 * @param {String} budget Indicates which budget should be displayed.
 * @param {String} type Indictates which type of transactions should be displayed.
 * @param {Object} startDate Indictates the start of the date range for transactions to be displayed.
 * @param {Object} endDate Indictates the end of the date range for transactions to be displayed.
 * @param {String} amountFrom Indictates a minimum amount for transactions to be displayed.
 * @param {String} amountTo Indictates a maximum amount for transactions to be displayed.
 * @param {String} name Indictates which transactions should be displayed (by name).
 * @param {String} category Indictates which category should be displayed.
 */
function displayContent( displayType, budget, type, startDate, endDate, amountFrom, amountTo,
                         name, category ) {
    // Before doing anything, we check if the input is valid.
    // Input invalid?
    if ( !(checkAmountInput( amountFrom, true ) && checkAmountInput( amountTo, true )) ) {
        // Display an error message and stop executing this function.
        $( "#mainContent" ).html( "<center><i>" + textElements.invalidInput + "</i></center>" );
        return;
    }
    // Get all data before displaying anthing.
    // Find out which data the user wants to see, then apply filter and display the chart.
    var paramList = [];
    if ( budget.length > 0 ) paramList.push( ["budget", budget] );
    if ( type.length > 0 ) paramList.push( ["type", type] );
    if ( name.length > 0 ) paramList.push( ["name", name] );
    if ( category.length > 0 ) paramList.push( ["category", category] );
    // Now, create a quest. If no parameter were selected, we get all data unfiltered.
    var quest;
    // At least one filter?
    if ( paramList.length > 0 ) {
        quest = { connector : "and", params : paramList };
    }
    // No filter?
    else {
        // No filters applied? Select all data.
        quest = { connector : "or", params : [["type", "earning"], ["type", "spending"]] };
    }
    // Find out in which files we want to search.
    var files = [];
    // Date selected?
    if ( startDate !== null && endDate !== null ) {
        // Get start and end date as a file name (reversed file name).
        var startDateFileName = startDate.getFullYear() + "." +
                                ((startDate.getMonth() + 1) < 10 ?
                                "0" + (startDate.getMonth() + 1) :
                                (startDate.getMonth() + 1));
        var endDateFileName = endDate.getFullYear() + "." +
                              ((endDate.getMonth() + 1) < 10 ?
                              "0" + (endDate.getMonth() + 1) :
                              (endDate.getMonth() + 1));
        // For comparing, we need to reverse file names.
        var allFiles = getJSONFiles();
        for ( var i = 0; i < allFiles.length; i++ ) {
            // Reverse file name.
            var tmp = allFiles[i].split( "." )[1] + "." + allFiles[i].split( "." )[0];
            // Check if the file is in the given range
            // (Note: This will only filter months and years).
            if ( startDateFileName <= tmp && endDateFileName >= tmp ) {
                files.push( allFiles[i] );
            }
        }
    }
    // No date filter? Apply the standard range (current month).
    else {
        // Returns the current file (without .json ending).
        files.push( getCurrentFileName().substring( 0, getCurrentFileName().lastIndexOf( "." ) ) );
    }
    // Get all the matching data from every available file.
    var data = [];
    for ( var i = 0; i < files.length; i++ ) {
        // Append new data to the data we already found.
        data = getData( files[i] + ".json", quest ).concat( data );
    }
    // Filter the data again.
    var newData = [];
    var totalSum = 0;
    for ( var i = 0; i < data.length; i++ ) {
        // Amount not within the specified range? Continue without pushing the data.
        // Minimum amount exists?
        if ( amountFrom.length > 0 && parseFloat( amountFrom ) > data[i].amount ) {
            continue;
        }
        // Maximum amount exists?
        if ( amountTo.length > 0 && parseFloat( amountTo ) < data[i].amount ) {
            continue;
        }
        // Date not within the specified range? Continue without pushing the data.
        // Start date exists?
        if ( startDate !== null && startDate.getMonth() === new Date( data[i].date * 1000 ).getMonth()
                                && startDate.getFullYear() === new Date( data[i].date * 1000 ).getFullYear() ) {
            if ( startDate.getDate() > new Date( data[i].date * 1000 ).getDate() ) {
                continue;
            }
        }
        // End date exists?
        if ( endDate !== null && endDate.getMonth() === new Date( data[i].date * 1000 ).getMonth() 
                              && endDate.getFullYear() === new Date( data[i].date * 1000 ).getFullYear()) {
            if ( endDate.getDate() < new Date( data[i].date * 1000 ).getDate() ) {
                continue;
            }
        }
        // If we passed the filters above, we can push the data.
        newData.push( data[i] );
        totalSum += data[i].amount;
    }
    // Save the filtered data.
    data = newData;
    // Data exists?
    if ( data.length > 0 ) {
        // Display the real content. Display a graph?
        if ( displayType === "graph" ) {
            displayGraph( data );
        }
        // Display a table?
        else if ( displayType === "table" ) {
            displayTable( data );
        }
        totalSum = beautifyAmount( Math.round( totalSum * 1e2 ) / 1e2 );
        $( '#mainContent' ).append(
            "<br>" +
            "<center>" +
                textElements.totalSum + ": " + totalSum + getCurrencySign() +
            "</center>"
        );
    }
    // No data found?
    else {
        // Display a message that no data was found.
        $( "#mainContent" ).html( "<center><i>" + textElements.noTransactions + "</i></center>" );
    }
}

function displayGraph( data ) {
    // Create a canvas for our chart.
    $( "#mainContent" ).html( "<br><canvas id=\"graphCanvas\"></canvas>" );
    var dataset = [], labels = [];
    // Get the dataset (amounts) and labels (names).
    for ( var i = 0; i < data.length; i++ ) {
        // Add the amount and name for our graph.
        var amount = beautifyAmount( data[i].amount );
        dataset.push( amount );
        labels.push( data[i].name );
    }
    // Now we can display the graph.
    createChart( $( "#graphCanvas" )[0], labels, dataset, colors, colors,
                 readPreference( "chartType" ) );
}

function displayTable( data ) {
    // Create the headings for the table.
    var tableHeadingsText = textElements.mainContentTableHeadings;
    var tableHeadingsHTML = "";
    for ( var i = 0; i < tableHeadingsText.length; i++ ) {
        tableHeadingsHTML += "<th onclick='sortTable(" + i + ")'><b>" + tableHeadingsText[i] + "</b></th>";
    }
    // Get the content for the table.
    var tableContentHTML = "";
    for ( var j = 0; j < data.length; j++ ) {
        var amount = beautifyAmount( data[j].amount );
        // Add the data to our table.
        tableContentHTML += "<tr class=\"w3-hover-light-blue\">" +
                            "<td>" + dateToString( data[j].date ) + "</td>" +
                            "<td>" + data[j].name + "</td>" +
                            "<td>" + amount + getCurrencySign() + "</td>" +
                            "<td>" + data[j].category + "</td>" +
                            "<td>" + data[j].budget + "</td>" +
                            "<td>" + (data[j].type == "earning" ?
                                     textElements.earning :
                                     textElements.spending) + "</td>" +
                            "<td>" + "<span onclick=\"deleteEntry('" + data[j].date + "');\"" +
                            "class=\"w3-button\">" +
                            "<i class=\"fas fa-times w3-text-red\"></i></span></li>" +
                            "</td></tr>";
    }
    // Display the table containing the data.
    $( "#mainContent" ).html( "<br><table id='overviewTable' class=\"w3-table-all w3-round\">" +
                              "<tr>" + tableHeadingsHTML + "</tr>" +
                              tableContentHTML + "</table>" );
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
 * @param {String} number The number of the datepicker we want to display.
 */
function showDatepicker( number ) {
    $( "#datepicker" + number ).datepicker({
        dateFormat: "dd.mm.yy",
        // Min date: tomorrow
        minDate: (number === "2" ? new Date( (getCurrentDate() + 86400) * 1000 ) : null),
        monthNames : textElements.monthNames,
        monthNamesShort : textElements.monthNamesShort,
        dayNames: textElements.dayNames,
        dayNamesShort : textElements.dayNamesShort,
        dayNamesMin : textElements.dayNamesMin
    });
    $( "#datepicker" + number ).datepicker("show");
}

/**
 * This function updates the view when changes are made.
 */
function updateView() {
    textElements = require( "../text/balances_" + getLanguage() + ".json.js" );
    // Display a list of currently available budgets.
    displayBudgets();
    // Display the budgets in detail.
    updateContent();
    displayContentControls();
    // Display a list of currently recurring transactions.
    displayRecurringTransactions();
}
