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