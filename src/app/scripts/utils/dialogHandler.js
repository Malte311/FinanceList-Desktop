const InputHandler = require(__dirname + '/inputHandler.js');

/**
 * Class for handling all kinds of dialogs.
 */
module.exports = class DialogHandler {
	constructor(view) {
		this.view = view;
		this.inputHandler = new InputHandler(this.view.storage);

		let dialogHandler = this; // this binding will be overridden in the upcoming block.
		$('#divModal').on('show.bs.modal', function(event) {
			let btnId = $(event.relatedTarget).attr('id'); // Button that triggered the modal.

			let modal = $(this);
			modal.find('.modal-footer #modalCanc').html(dialogHandler.view.textData['cancel']);
			modal.find('.modal-footer #modalConf').html(dialogHandler.view.textData['confirm']);
			modal.find('.modal-footer #modalConf').off(); // Remove previous listener.

			switch (btnId) {
				case 'btnAddBudget':
					dialogHandler.addBudget(modal);
					break;
				case 'btnAddTransact':
					dialogHandler.addTransaction(modal);
					break;
			}

			$(`[lang=${dialogHandler.view.lang}]`).show();
		});
	}

	/**
	 * Displays a dialog to add a new budget and handles the interaction of this dialog.
	 * 
	 * @param {object} modal The dialog object (to access the dialog).
	 */
	addBudget(modal) {
		modal.find('.modal-title').html(this.view.textData['addBudget']);
		modal.find('.modal-body').html(this.view.template.fromTemplate('addBudgetDialog.html'));
		
		modal.find('.modal-footer #modalConf').on('click', () => {
			let newBudget = $('#dialogInput').val().trim();
			if (!this.inputHandler.isValidBudgetName(newBudget)) return;

			['budgets', 'allTimeEarnings', 'allTimeSpendings', 'allocation'].forEach(field => {
				this.view.storage.addToMainStorageArr(field, [newBudget, 0]);
			});

			modal.modal('hide');
			this.view.updateView();
		});
	}

	/**
	 * Displays a dialog to rename a budget and handles the interaction of this dialog.
	 * 
	 * @param {String} name The name of the budget we want to change.
	 */
	renameBudget(name) {
		let budgets = this.view.storage.readMainStorage('budgets');

		return;

		// Add an input field.
		createDialog( textElements.renameBudget,
					textElements.newBudgetName + "<br><input type=\"text\" id=\"dialogInput\">", function() {
			// Get all currently available budgets.
			var currentBudgets = readMainStorage( "budgets" );
			// Rename the budget in all time earnings/spendings as well.
			var allTimeEarnings = readMainStorage( "allTimeEarnings" );
			var allTimeSpendings = readMainStorage( "allTimeSpendings" );
			// For allocation as well.
			var allocation = readMainStorage( "allocation" );
			// We add all budgets to this (and the renamed one with its new name)
			var updatedBudgets = [],
				updatedAllTimeEarnings = [],
				updatedAllTimeSpendings = [],
				newAllocation = [];
			var newName = $( "#dialogInput" ).val().trim();
			// Iterate over them to find the one we want to rename.
			// Remember that all the fields are all in the same order, so we can use the same index.
			for ( var i = 0; i < currentBudgets.length; i++ ) {
				// Found it? Rename it.
				if ( currentBudgets[i][0] === name ) {
					updatedBudgets.push( [newName, currentBudgets[i][1]] );
				}
				// Not the budget we are looking for? Push the budget unmodified.
				else {
					updatedBudgets.push( currentBudgets[i] );
				}
				// Do the same for allTimeEarnings and allTimeSpendings.
				if ( allTimeEarnings[i][0] === name ) {
					updatedAllTimeEarnings.push( [newName, allTimeEarnings[i][1]] );
				}
				else {
					updatedAllTimeEarnings.push( allTimeEarnings[i] );
				}

				if ( allTimeSpendings[i][0] === name ) {
					updatedAllTimeSpendings.push( [newName, allTimeSpendings[i][1]] );
				}
				else {
					updatedAllTimeSpendings.push( allTimeSpendings[i] );
				}
				// And for allocation as well.
				if ( allocation[i][0] === name ) {
					newAllocation.push( [newName, allocation[i][1]] );
				}
				else {
					newAllocation.push( allocation[i] );
				}
			}
			// Rename recurring transactions using this budget.
			var recurringTransactions = readMainStorage( "recurring" );
			// Search for transactions involving this budget.
			for ( var i = 0; i < recurringTransactions.length; i++ ) {
				// Found the budget? Rename it.
				if ( recurringTransactions[i].budget === name ) {
					recurringTransactions[i].budget = newName;
				}
			}
			// Save the updated budgets in the mainStorage.json file.
			writeMainStorage( "budgets", updatedBudgets );
			// Again, we do this as well for allTimeEarnings and allTimeSpendings.
			writeMainStorage( "allTimeEarnings", updatedAllTimeEarnings );
			writeMainStorage( "allTimeSpendings", updatedAllTimeSpendings );
			// Also, rename recurring transactions.
			writeMainStorage( "recurring", recurringTransactions );
			// Same for allocation.
			writeMainStorage( "allocation", newAllocation );
			// Update the view: Display the new name.
			updateView();

			
			// Now we can rename all data for this budget (in the background).
			var allFiles = getJsonFiles();
			for ( var i = 0; i < allFiles.length; i++ ) {
				// Filter the data. First, we get ALL data (earning OR spending will deliver everything).
				var quest = { connector : "or", params : [["type", "earning"],["type", "spending"]] };
				// Now, get the data.
				var data = getData( allFiles[i] + ".json", quest );
				// Iterate over all the data and find the data which has to be renamed.
				for ( var j = 0; j < data.length; j++ ) {
					// Found the correct budget? Rename it.
					if ( data[j].budget === name ) {
						data[j].budget = newName;
					}
				}
				// Now replace the old data with the new data.
				replaceData( allFiles[i] + ".json", data );
			}
		});
	}

	addTransaction(modal) {
		modal.find('.modal-title').html(this.view.textData['addTransaction']);
		modal.find('.modal-body').html(this.view.template.fromTemplate('addTransactDialog.html'));
		
		modal.find('.modal-body #dateInput').datepicker({
			autoclose: true,
			format: 'dd.mm.yyyy',
			language: 'de', // this.view.storage.readPreference('language')
			setDate: '31.03.2020', // DateHandler.timestampToString(DateHandler.getCurrentTimestamp())
			todayHighlight: true
		});
		
		modal.find('.modal-footer #modalConf').on('click', () => {
			// let budgets = this.view.storage.readMainStorage('budgets');
			modal.modal('hide');
			this.view.updateView();
		});
		

		return;

		// "transactionDialogTextElements": ["Konto", "Automatisieren", "Enddatum", "nie"],

		var currentBudgets = readMainStorage('budgets');
		var options = "";
		// Display an option for every available budget, so the user can select any budget.
		for ( var i = 0; i < currentBudgets.length; i++ ) {
			options += "<option value=\"" + currentBudgets[i][0] + "\">" + currentBudgets[i][0] + "</option>";
		}
		// Find out which language is selected to set the text elements of the dialog.
		var textElementsLocal = textElements.transactionDialogTextElements;
		// Set options for selecting an interval (when automation is avtivated).
		var intervalOptions = "", intervalOptionsTextElements = textElements.intervalOptionsTextElements;
		for ( var i = 0; i < intervalOptionsTextElements.length; i++ ) {
			// Monthly? Set as default (keep in mind that "monthly" has to be index 2 all the time).
			if ( i === 2 ) {
				intervalOptions += "<option selected=\"selected\">" + intervalOptionsTextElements[i] + "</option>";
			}
			// Not monthly? Not selected.
			else {
				intervalOptions += "<option>" + intervalOptionsTextElements[i] + "</option>";
			}
		}
		// Set the complete content for the dialog.
		// First two lines are radio buttons to select between earning and spending.
		let DateHandler = require('../scripts/utils/dateHandler.js');
		var text = 
				// Choose between manual and automated allocation. Hidden until "earning" is selected.
				"<div id=\"dynamicDiv1\" style=\"display:none;\"><hr>" +
						"<form class=\"w3-center\"><input id=\"manual\"" +
						"onclick=\"updateTransactionDialog();\" type=\"radio\" name=\"allocation\">" +
						textElementsLocal[8] +
						"<input id=\"autoAllocation\" onclick=\"updateTransactionDialog();\"" +
						"style=\"margin-left:15px;\" type=\"radio\" name=\"allocation\" checked>" +
						textElementsLocal[9] + "</form>" +
				"</div>" +
				// Budget select will be displayed at the beginning
				// (because spending is selected as a default).
				"<div id=\"dynamicDiv2\"><hr><b>" +
						textElementsLocal[10] + "</b><br>" +
						"<select id=\"selectInput\">" + options + "</select>" +
				"</div><hr>" +
				// Option to automate this transaction.
				"<div id=\"budgetSelect\"></div>" +
				"<input type=\"checkbox\" id=\"checkboxInput\"" +
				"onclick=\"updateTransactionDialog();\">" + textElementsLocal[11] +
				// Another dynamic div, which changes when the checkbox is activated/deactivated.
				"<br>" +
				"<div id=\"dynamicDiv3\" style=\"display:none;\">" +
					"<select id=\"intervalSelect\">" + intervalOptions + "</select>" +
					"  " + textElementsLocal[12] + ": " +
					"<input id=\"datepicker2\" class=\"w3-round-large w3-light-gray\"" +
					"type=\"button\" onclick=\"showDatepicker('2');\" value=\"" +
					textElementsLocal[13] + "\">" +
				"</div>";
		// Now we are able to actually create a dialog.
		createDialog( textElements.addTransaction, text, function() {
			// Save the inputs and then execute the right function to add a new entry.
			var name = $( "#nameInput" ).val().trim();
			var sum = $( "#sumInput" ).val().replace(',', '.').trim();
			var category = $( "#categoryInput" ).val().trim();
			
			var inputOk = checkAmountInput( sum, false );
			if ( name.length > maxStrLen || category.length > maxStrLen ) inputOk = false;
			name.split(" ").forEach( e => {
				if ( e.length > maxSWLen ) inputOk = false;
			});
			category.split(" ").forEach( e => {
				if ( e.length > maxSWLen ) inputOk = false;
			});
			// Input ok? Then continue.
			if ( inputOk ) {
				// Get the selected budget.
				var budget = $( "#selectInput option:selected" ).text();
				// Get the selected date.
				var selectedDate = $( "#datepicker1" ).datepicker( "getDate" );
				var date, endDate;
				// Make sure, a date was selected.
				if ( selectedDate !== null && selectedDate !== undefined ) {
					// Remember that we want dates in seconds, so we divide by 1000.
					date = Math.floor( new Date( selectedDate ).getTime() / 1000 );
				}
				// Otherwise use the current date (today).
				else {
					date = DateHandler.getCurrentTimestamp();
				}
				var selectedEndDate = $( "#datepicker2" ).datepicker( "getDate" );
				if ( selectedEndDate !== null && selectedEndDate !== undefined ) {
					endDate = Math.floor(
						new Date( $( "#datepicker2" ).datepicker( "getDate" ) ).getTime() / 1000 );
				}
				// End date -1 means there is no end date.
				else {
					endDate = -1;
				}

				// Make sure that the date as a timestamp is unique
				date = DateHandler.createUniqueTimestamp( date );

				// Find out which type (earning/spending) was selected and
				// execute the correct function.
				if ( $( "#earning" )[0].checked ) {
					addEarning( name, parseFloat( sum ), budget, category, date,
						$( "#autoAllocation" )[0].checked && readMainStorage( "allocationOn" ) );
				}
				else if ( $( "#spending" )[0].checked ) {
					addSpending( name, parseFloat( sum ), budget, category, date );
				}

				// Automation activated?
				if ( $( "#checkboxInput" )[0].checked ) {
					// Add a new recurring transaction.
					var type = $( "#earning" )[0].checked ? "earning" : "spending";
					addRecurringTransaction( name, parseFloat( sum ), budget, category, type,
						$("#intervalSelect")[0].selectedIndex, date, endDate );
				}
				// Close the dialog and update the view.
				$( this ).dialog( "close" );
				updateView();
				// Add the inputs to our array for autocomplete.
				var availableNames = readMainStorage( "availableNames" );
				availableNames.push( name );
				// Make sure, we have only unique elements.
				availableNames = availableNames.filter( function( value, index, self ) {
					return self.indexOf( value ) === index;
				});
				var availableCategories = readMainStorage( "availableCategories" );
				availableCategories.push( category );
				// Make sure, we have only unique elements.
				availableCategories = availableCategories.filter( function( value, index, self ) {
					return self.indexOf( value ) === index;
				});
				// Write back to storage.
				writeMainStorage( "availableNames", availableNames );
				writeMainStorage( "availableCategories", availableCategories );
			}
			// Wrong input: Show error message.
			else {
				dialog.showErrorBox( "Invalid input",
				"The amount is not a valid number or your input is too long" +
				" (max. " + maxSWLen + " characters per word and max. " + maxStrLen +
				" characters in total allowed)!" );
			}
		});

		// Autocomplete for user inputs.
		$( "#nameInput" ).autocomplete({
			source: readMainStorage( "availableNames" )
		});
		$( "#categoryInput" ).autocomplete({
			source: readMainStorage( "availableCategories" )
		});
	}
}