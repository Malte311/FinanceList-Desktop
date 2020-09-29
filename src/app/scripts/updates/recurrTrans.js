const {getCurrentTimestamp, stepInterval} = require(__dirname + '/../utils/dateHandler.js');

module.exports = class RecurrTrans {
	constructor(storage) {
		this.storage = storage;
	}

	/**
	 * Executes all due recurring transactions.
	 */
	execRecurrTransact() {
		let recurrTrans = this.storage.readMainStorage('recurring');

		for (let t of recurrTrans) {
			while (t.nextDate <= getCurrentTimestamp()) {
				if (t.endDate < 0 || (t.endDate > 0 && t.nextDate <= t.endDate)) {
					let addEntry = t.type === 'earning' ? addEarning : addSpending;
					addEntry(t.name, t.amount, t.budget, t.category, t.nextDate, t.allocationOn);

					t.nextDate = stepInterval(t.startDate, t.nextDate, t.interval);
					
					this.storage.writeMainStorage('recurring', recurrTrans);
				} else {
					this.deleteRecurringTransaction(t.name); // End date reached
				}
			}

			if (t.endDate > 0 && t.nextDate > t.endDate) {
				this.deleteRecurringTransaction(t.name);
			}
		}

		// for (let i = 0; i < recurrTrans.length; i++) {
		// 	while (recurrTrans[i].nextDate <= getCurrentTimestamp()) {
		// 		// End date not existing or not reached yet?
		// 		if ( recurrTrans[i].endDate < 0
		// 				|| (recurrTrans[i].endDate > 0
		// 					&& recurrTrans[i].nextDate <= recurrTrans[i].endDate) ) {
		// 			// Execute the correct transaction.
		// 			// Earning? => addEarning(...)
		// 			if ( recurrTrans[i].type === 'earning' ) {
		// 				addEarning( recurrTrans[i].name, recurrTrans[i].amount,
		// 							recurrTrans[i].budget, recurrTrans[i].category,
		// 							recurrTrans[i].nextDate, recurrTrans[i].allocationOn );
		// 			}
		// 			// Spending? => addSpending(...)
		// 			else if ( recurrTrans[i].type === 'spending' ) {
		// 				addSpending( recurrTrans[i].name, recurrTrans[i].amount,
		// 							recurrTrans[i].budget, recurrTrans[i].category,
		// 							recurrTrans[i].nextDate );
		// 			}
		// 			// Update the recurring transaction entry.
		// 			recurrTrans[i].nextDate = stepInterval(recurrTrans[i].startDate, recurrTrans[i].nextDate,
		// 															recurrTrans[i].interval );
		// 			// When we are done with updating, we write the new data back
		// 			// to mainStorage.json (only the date changed).
		// 			writeMainStorage( 'recurring', recurrTrans );
		// 		}
		// 		// End date reached?
		// 		else {
		// 			// Delete the recurring transaction.
		// 			deleteRecurringTransaction( recurrTrans[i].name );
		// 		}
		// 	}
		// 	// End date exists and got reached?
		// 	if ( recurrTrans[i].endDate > 0
		// 			&& recurrTrans[i].nextDate > recurrTrans[i].endDate ) {
		// 		// Delete the recurring transaction.
		// 		deleteRecurringTransaction( recurrTrans[i].name );
		// 	}
		// }
	}

	/**
	 * Creates a new recurring transaction.
	 * 
	 * @param {object} transObj The transaction object to add.
	 */
	addRecurringTransaction(transObj) {
		let newDate = stepInterval(transObj.date, transObj.date, transObj.interval);

		if (transObj.endDate < 0 || (transObj.endDate > 0 && newDate <= transObj.endDate)) {
			transObj.nextDate = newDate;
			this.storage.addToMainStorageArr('recurring', transObj);
			
			this.execRecurrTransact();
		}
	}

	/**
	 * This function edits a recurring transaction with a given name.
	 * @param {String} name The name of the recurring transaction we want to edit.
	 * @param {number} index The index of the transaction (the name is not unique).
	 */
	editRecurringTransaction( name, index ) {
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
	}

	/**
	 * This function deletes a recurring transaction.
	 * @param {String} name The name of the transaction we want to delete.
	 * @param {number} index The index of the transaction (the name is not unique).
	 */
	deleteRecurringTransaction( name, index ) {
		// Get current transactions.
		var currentRecurringTransactions = readMainStorage( "recurring" );
		// Search the transaction we want to delete.
		for ( var i = 0; i < currentRecurringTransactions.length; i++ ) {
			// Found it? Delete it and stop.
			if ( currentRecurringTransactions[i].name === name && i == index ) {
				currentRecurringTransactions.splice( i, 1 );
				break;
			}
		}
		// Write back to mainStorage.json.
		writeMainStorage( "recurring", currentRecurringTransactions );
		// Update the view: Don't display the transaction anymore.
		updateView();
	}
}