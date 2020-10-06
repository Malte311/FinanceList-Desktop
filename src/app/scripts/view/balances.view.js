/*
editRecurringTransaction():

var textElementsLocal = textElements.editRecurringTransaction;
var currentRecurringTransactions = readMainStorage( "recurring" );
var transaction = null;

// Search the transaction we want to edit.
for ( var i = 0; i < currentRecurringTransactions.length; i++ ) {
	if ( currentRecurringTransactions[i].name === name && i == index ) {
		transaction = currentRecurringTransactions[i];
		break;
	}
}

if ( transaction != null ) {
	var content = textElementsLocal[1] + "<br>" +
				"<input type=\"text\" id=\"recAmountInput\" value='" +
				transaction.amount + "'>" + getCurrencySign() + "<br><hr>" +
				textElementsLocal[2] + "<br>" +
				"<select class=\"w3-select\" id=\"recIntSelect\">" + "<br>";

	var intervals = textElements.intervalOptionsTextElements;
	for ( var i = 0; i < intervals.length; i++ ) {
		if ( transaction.interval == i ) {
			content += "<option selected=\"selected\">" + intervals[i] + "</option>";
		}
		else {
			content += "<option>" + intervals[i] + "</option>";
		}
	}
	content += "</select>";

	createDialog( textElementsLocal[0], content, function() {
		var amountInput = $( "#recAmountInput" ).val().trim();
		var intervalSelect = $( "#recIntSelect" )[0].selectedIndex;

		if ( inputHandler.isValidAmount( amountInput, false ) ) {
			// Something changed?
			if ( amountInput != transaction.amount || intervalSelect != transaction.interval ) {
				transaction.amount = parseFloat( amountInput );
				transaction.interval = intervalSelect;
				currentRecurringTransactions[index] = transaction;

				// Write back to mainStorage.json.
				writeMainStorage( "recurring", currentRecurringTransactions );
				updateView();
			}
			$( this ).dialog( "close" );
		}
		else {
			dialog.showErrorBox( "Error", "Invalid input" );
		}
	});
}
*/

function displayGraph( data ) {
    // Create a canvas for our chart.
    $( "#mainContent" ).html( "<br><canvas id=\"graphCanvas\"></canvas>" );
    var dataset = [], labels = [];
    // Get the dataset (amounts) and labels (names).
    for ( var i = 0; i < data.length; i++ ) {
        // Add the amount and name for our graph.
        var amount = data[i].amount.toFixed(2);
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
	
	let DateHandler = require('../scripts/utils/dateHandler.js');
    // Get the content for the table.
    var tableContentHTML = "";
    for ( var j = 0; j < data.length; j++ ) {
        var amount = data[j].amount.toFixed(2);
		// Add the data to our table.
        tableContentHTML += "<tr class=\"w3-hover-light-blue\">" +
                            "<td>" + DateHandler.timestampToString( data[j].date ) + "</td>" +
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