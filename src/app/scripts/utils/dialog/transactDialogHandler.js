const InputHandler = require(__dirname + '/../inputHandler.js');
const Transact = require(__dirname + '/../../handle/transact.js');
const {dateToTimestamp} = require(__dirname + '/../dateHandler.js');

/**
 * Handles all dialogs related to transactions.
 */
module.exports = class TransactDialogHandler {
	constructor(view) {
		this.view = view;
		this.inputHandler = new InputHandler(this.view.storage);
		this.transact = new Transact(this.view.storage);
	}

	/**
	 * Displays a dialog to add a new transaction and handles the interaction of this dialog.
	 */
	addTransaction() {
		this.addDialogElements();
		this.addDialogCallback();
	}

	/**
	 * Adds the necessary information to the dialog display.
	 */
	addDialogElements() {
		let modal = $('#divModal');

		modal.find('.modal-title').html(this.view.textData['addTransaction']);
		modal.find('.modal-body').html(this.view.template.fromTemplate('addTransactDialog.html'));

		$(`#${this.view.lang}Spending`).prop('checked', true); // Select spending by default
		
		['dateYear', 'endDateYear'].forEach(id => $(`#${id}`).val((new Date()).getFullYear()));
		['dateMonth', 'endDateMonth'].forEach(id => $(`#${id}`).val((new Date()).getMonth() + 1));
		['dateDay', 'endDateDay'].forEach(id => $(`#${id}`).val((new Date()).getDate()));

		modal.find('.modal-body #dateInput').datepicker({
			autoclose: true,
			format: 'dd.mm.yyyy',
			language: 'de', // this.view.storage.readPreference('language')
			setDate: '31.03.2020', // DateHandler.timestampToString(DateHandler.getCurrentTimestamp())
			todayHighlight: true
		});

		this.view.storage.readMainStorage('budgets').forEach(budget => {
			$('#budgetSelect').append(new Option(budget[0], budget[0]));
		});

		// $('#nameInput').autocomplete({
		// 	source: readMainStorage('availableNames')
		// });
		// $('#categoryInput').autocomplete({
		// 	source: readMainStorage('availableCategories')
		// });
	}

	/**
	 * Adds a callback for the dialog when the confirm button is pressed.
	 */
	addDialogCallback() {
		let modal = $('#divModal');

		modal.find('.modal-footer #modalConf').on('click', () => {
			if (!this.inputHandler.isValidAmount($('#sumInput').val().trim())) {
				return;
			}

			if (!this.inputHandler.isValidDate($('#dateDay').val(), $('#dateMonth').val(), $('#dateYear').val())) {
				return;
			}

			let obj = {
				date: dateToTimestamp($('#dateDay').val(), $('#dateMonth').val(), $('#dateYear').val()),
				name: $('#nameInput').val().trim(),
				amount: $('#sumInput').val().trim(),
				budget: $('#budgetSelect option:selected').text(),
				type: $('input[name="type"]:checked').val(),
				category: $('#categoryInput').val().trim()
			};
			//this.transact.addEarning()

			this.view.addToAutocomplete('availableNames', $('#nameInput').val().trim());
			this.view.addToAutocomplete('availableCategories', $('#categoryInput').val().trim());

			modal.modal('hide');
			this.view.updateView();
		});

		return;

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
			addSpending({"date": date, "name": name, "amount": parseFloat( sum ), "budget": budget,
		"type": "spending", "category": category} );
		}

		// Automation activated?
		if ( $( "#checkboxInput" )[0].checked ) {
			// Add a new recurring transaction.
			var type = $( "#earning" )[0].checked ? "earning" : "spending";
			let allocationOn = $('#earning')[0].checked && $('#autoAllocation')[0].checked && this.storage.readMainStorage('allocationOn');
			addRecurringTransaction({
				name: name,
				amount: parseFloat( sum ),
				budget: budget,
				category: category,
				type: type,
				interval: $("#intervalSelect")[0].selectedIndex,
				date: date,
				endDate: endDate,
				allocationOn: allocationOn
			});
		}
	}
}