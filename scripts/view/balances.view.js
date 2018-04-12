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
                      "<td>" + getRecurringTransactionsHeadings()[7] + "</td>" +
                      "<td>" + getRecurringTransactionsHeadings()[8] + "</td>" +
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
                       "<td>" + dateToString( recurringTransactions[i].nextDate ) + "</td>" +
                       "<td>" + getIntervalOptionsTextElements()[recurringTransactions[i].interval] + "</td>" +
                       "<td>" + (recurringTransactions[i].endDate > 0 ? dateToString( recurringTransactions[i].endDate ) : "&mdash;") + "</td>" +
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
            "<input id=\"graph\" onclick=\"displayContent('graph', '', '', '', '', '', '', '', '');\" type=\"radio\" name=\"type\" checked>" +
            getDisplayTypeTextElements()[0] +
            "<input id=\"table\" onclick=\"displayContent('table', '', '', '', '', '', '', '', '');\" style=\"margin-left:15px;\" type=\"radio\" name=\"type\">" +
            getDisplayTypeTextElements()[1] +
        "</form><hr>" +
        // Display filters for the user so they can choose which data they want to see.
        "<div>" +
            "<table align=\"center\">" +
                "<tr>" +
                    "<td>" +
                        "<select class=\"w3-select\" id=\"budgetSelect\">" +
                            "<option selected=\"selected\">" + getMainContentFilterText()[0] + "</option>" + budgetOptions +
                        "</select>" +
                    "</td>" +
                    "<td>" +
                        "<select class=\"w3-select\" id=\"typeSelect\">" +
                            "<option selected=\"selected\">" + getMainContentFilterText()[1] + "</option>" +
                            "<option>" + getMainContentFilterText()[2] + "</option>" +
                            "<option>" + getMainContentFilterText()[3] + "</option>" +
                        "</select>" +
                    "</td>" +
                    "<td>" +
                        "<input id=\"dateSelect\" class=\"w3-round-large w3-white\"  onclick=\"showDatepicker('3');\">" +
                    "</td>" +
                    "<td>" +
                        "<input id=\"amountFrom\" type=\"text\" size=\"2\">" + getCurrencySign() + " " + getMainContentFilterText()[5] + " " +
                        "<input id=\"amountTo\" type=\"text\" size=\"2\">" + getCurrencySign() +
                    "</td>" +
                    "<td>" +
                        "<input id=\"nameSelect\" type=\"text\" size=\"15\" placeholder=\"" + getMainContentFilterText()[6] + "\">" +
                    "</td>" +
                    "<td>" +
                        "<input id=\"categorySelect\" type=\"text\" size=\"15\" placeholder=\"" + getMainContentFilterText()[7] + "\">" +
                    "</td>" +
                    "<td>" +
                        "<button class=\"w3-button w3-white w3-round-xlarge\" onclick=\"updateContent();\">" + getMainContentStartButtonText() + "</button>" +
                    "</td>" +
                "</tr>" +
            "</table>" +
        "</div>" );
    // Activate the datepicker.
    var textElements = getRangeDatePickerPresetRangesTextElements();
    $( "#dateSelect" ).daterangepicker({
        initialText: dateToString( getCurrentDate() - 604800 ) + " - " + dateToString( getCurrentDate() ),
        dateFormat: "dd.mm.yy",
        applyButtonText: getRangeDatePickerApplyButtonText(),
        clearButtonText: getRangeDatePickerClearButtonText(),
        cancelButtonText: getRangeDatePickerCancelButtonText(),
        presetRanges: [
				{text: textElements[0], dateStart: function() { return moment() }, dateEnd: function() { return moment() } },
				{text: textElements[1], dateStart: function() { return moment().subtract('days', 1) }, dateEnd: function() { return moment().subtract('days', 1) } },
				{text: textElements[2], dateStart: function() { return moment().subtract('days', 6) }, dateEnd: function() { return moment() } },
				{text: textElements[3], dateStart: function() { return moment().subtract('days', 7).isoWeekday(1) }, dateEnd: function() { return moment().subtract('days', 7).isoWeekday(7) } },
				{text: textElements[4], dateStart: function() { return moment().startOf('month') }, dateEnd: function() { return moment() } },
				{text: textElements[5], dateStart: function() { return moment().subtract('month', 1).startOf('month') }, dateEnd: function() { return moment().subtract('month', 1).endOf('month') } },
				{text: textElements[6], dateStart: function() { return moment().startOf('year') }, dateEnd: function() { return moment() } },
                {text: textElements[7], dateStart: function() { return moment().subtract('year', 1).startOf('year') }, dateEnd: function() { return moment().subtract('year', 1).endOf('year') } }
		]
    });
    // Autocomplete for user inputs.
    $( "#nameSelect" ).autocomplete({
      source: readMainStorage( "availableNames" )
    });
    $( "#categorySelect" ).autocomplete({
      source: readMainStorage( "availableCategories" )
    });
}

/**
 * This function updates the content if the user clicks the update button to apply filters.
 */
function updateContent() {
    // Get all the information from input elements.
    // Get the selected display type (graph/table).
    var displayType = $( "#graph" )[0].checked ? "graph" : "table";
    // Find out, if a budget is selected, and if yes, which one.
    var budget;
    if ( $( "#budgetSelect" )[0].selectedIndex !== 0 ) {
        budget = $( "#budgetSelect option:selected" ).text();
    }
    else {
        budget = "";
    }
    // Find out, if a type is selected, and if yes, which one.
    var type;
    if ( $( "#typeSelect" )[0].selectedIndex !== 0 ) {
        if ( $( "#typeSelect" )[0].selectedIndex === 1 ) type = "earning";
        else if ( $( "#typeSelect" )[0].selectedIndex === 2 ) type = "spending";
    }
    else {
        type = "";
    }

    var date = $( "#dateSelect" ).daterangepicker( "getRange" );
    var startDate = null, endDate = null;
    if ( date !== null && date !== undefined ) {
        startDate = date.start;
        endDate = date.end;
    }

    var amountFrom = $( "#amountFrom" ).val().trim();
    var amountTo = $( "#amountTo" ).val().trim();
    // Find out which name is selected.
    var name = $( "#nameSelect" ).val().trim();
    // Find out which category is selected.
    var category = $( "#categorySelect" ).val().trim();

    // Now display the filtered content.

    console.log(displayType)
    console.log(budget)
    console.log(type)
    console.log(startDate)
    console.log(endDate)
    console.log(amountFrom)
    console.log(amountTo)
    console.log(name)
    console.log(category)

    displayContent( displayType, budget, type, startDate, endDate, amountFrom, amountTo, name, category );
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
function displayContent( displayType, budget, type, startDate, endDate, amountFrom, amountTo, name, category ) {
    // Get all data before displaying anthing.
    // Find out which data the user wants to see => apply filter and display the chart
    var paramList = [];
    if ( budget.length > 0 ) paramList.push( ["budget", budget] );
    if ( type.length > 0 ) paramList.push( ["type", type] );
    if ( name.length > 0 ) paramList.push( ["name", name] );
    if ( category.length > 0 ) paramList.push( ["category", category] );

    var quest;
    if ( paramList.length > 0 ) {
        quest = { connector : "and", params : paramList };
    }
    else {
        // No filters applied? Select all data.
        quest = { connector : "or", params : [["type", "earning"], ["type", "spending"]] };
    }
    var data = [];
    var allFiles = getJSONFiles();
    for ( var i = 0; i < allFiles.length; i++ ) {
        data = getData( allFiles[i] + ".json", quest ).concat( data );
    }

    var dateFilter = startDate !== null && endDate !== null;
    var amountFilter = amountFrom.length > 0 || amountTo.length > 0;

    console.log( "datfilter: " + dateFilter.toString() )
    console.log( "amountFilter: " + amountFilter.toString() )

    if ( !(checkAmountInput( amountFrom, true ) && checkAmountInput( amountTo, true )) ) {
        $( "#mainContent" ).html( "<center><i>" + getInvalidInputMessage() + "</i></center>" );
        return;
    }

    // Display the real content.
    // Display a graph?
    // TODO: Split this function into two functions (one for graph, one for table)
    if ( displayType === "graph" ) {
        // Create a canvas for our chart.
        $( "#mainContent" ).html( "<br><canvas id=\"graphCanvas\"></canvas>" );
        var dataset = [], labels = [];

        for ( var i = 0; i < data.length; i++ ) {
            // Apply the remaining filters
            if ( dateFilter ) {
                if ( amountFilter ) {
                    // both filters (date and amount)
                    if ( data[i].date * 1000 >= startDate.getTime() && data[i].date * 1000 <= endDate.getTime() &&
                         parseFloat( amountFrom ) >= data[i].amount && parseFloat( amountTo ) <= data[i].amount ) {
                        dataset.push( data[i].amount );
                        labels.push( data[i].name );
                    }
                }
                else {
                    // only date filter
                    if ( data[i].date * 1000 >= new Date( startDate ).getTime() && data[i].date * 1000 <= new Date( endDate ).getTime() ) {
                        dataset.push( data[i].amount );
                        labels.push( data[i].name );
                    }
                }
            }
            else if ( amountFilter ) {
                // only amount filter
                if ( parseFloat( amountFrom ) >= data[i].amount && parseFloat( amountTo ) <= data[i].amount ) {
                    dataset.push( data[i].amount );
                    labels.push( data[i].name );
                }
            }
            // No filter required
            else {
                console.log("no filter")
                dataset.push( data[i].amount );
                labels.push( data[i].name );
            }
        }
        createChart( $( "#graphCanvas" )[0], dataset, labels, colors, colors, readPreference( "chartType" ) );
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

        // Get the content for the table.
        var tableContentHTML = "";

        for ( var j = 0; j < data.length; j++ ) {
            // Display the amount correctly.
            var amount = data[j].amount;
            if ( amount.toString().indexOf( "." ) !== -1 ) {
                if ( amount.toString().split( "." )[1].length < 2 ) amount += "0";
            }
            // Add the data to our table.
            tableContentHTML += "<tr class=\"w3-hover-light-blue\"><td>" + dateToString( data[j].date ) + "</td>" +
                                "<td>" + data[j].name + "</td>" +
                                "<td>" + amount + getCurrencySign() + "</td>" +
                                "<td>" + data[j].category + "</td>" +
                                "<td>" + data[j].budget + "</td>" +
                                "<td>" + getType( data[j].type ) + "</td></tr>";
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
 * @param {String} number The number of the datepicker we want to display.
 */
function showDatepicker( number ) {
    $( "#datepicker" + number ).datepicker({
        dateFormat: "dd.mm.yy",
        // Min date: tomorrow
        minDate: (number === "2" ? new Date( (getCurrentDate() + 86400) * 1000 ) : null)
    });
    $( "#datepicker" + number ).datepicker("show");
}

/**
 * This function updates the view when changes are made.
 */
function updateView() {
    // Display a list of currently available budgets.
    displayBudgets();
    // Display the budgets in detail.
    displayContentControls();
    displayContent( "graph", "", "", "", "", "", "", "", "" );
    // Display a list of currently recurring transactions.
    displayRecurringTransactions();
}
