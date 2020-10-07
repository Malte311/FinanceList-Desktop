const InputHandler = require(__dirname + '/../inputHandler.js');
const Transact = require(__dirname + '/../../handle/transact.js');
const RecurrTrans = require(__dirname + '/../../updates/recurrTrans.js');
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

		// modal.find('.modal-body #dateInput').datepicker({
		// 	autoclose: true,
		// 	format: 'dd.mm.yyyy',
		// 	language: 'de', // this.view.storage.readPreference('language')
		// 	setDate: '31.03.2020', // DateHandler.timestampToString(DateHandler.getCurrentTimestamp())
		// 	todayHighlight: true
		// });

		this.view.storage.readMainStorage('budgets').forEach(budget => {
			$('#budgetSelect').append(new Option(budget[0], budget[0]));
		});

		if (this.view.storage.readMainStorage('allocationOn')) {
			$(`#${this.view.lang}AutoAl`).prop('checked', true); // Select auto allocation by default
		} else {
			$(`#allocForm`).hide();
			$(`#${this.view.lang}ManualAl`).prop('checked', true);
		}

		$('#nameInput').autocomplete({source: this.view.storage.readMainStorage('availableNames')});
		$('#categoryInput').autocomplete({source: this.view.storage.readMainStorage('availableCategories')});
	}

	/**
	 * Adds a callback for the dialog when the confirm button is pressed.
	 */
	addDialogCallback() {
		let modal = $('#divModal');

		modal.find('.modal-footer #modalConf').on('click', () => {
			if (!this.inputHandler.isValidAmount($('#sumInput').val().trim())
				|| !this.inputHandler.isValidDate($('#dateDay').val(), $('#dateMonth').val(), $('#dateYear').val())
				|| !this.inputHandler.isValidEntryName($('#nameInput').val().trim())
				|| (!this.inputHandler.isValidDate($('#endDateDay').val(), $('#endDateMonth').val(), $('#endDateYear').val())
						&& !$(`#${this.view.lang}NoEndDate`).prop('checked'))) {
				return;
			}

			this.createNewEntry();

			this.view.addToAutocomplete('availableNames', $('#nameInput').val().trim());
			this.view.addToAutocomplete('availableCategories', $('#categoryInput').val().trim());

			modal.modal('hide');
			this.view.updateView();
		});
	}

	/**
	 * Creates a new entry after the dialog has been confirmed.
	 */
	createNewEntry() {
		let autoAlloc = this.view.storage.readMainStorage('allocationOn');

		let obj = {
			date: dateToTimestamp($('#dateDay').val(), $('#dateMonth').val(), $('#dateYear').val()),
			name: $('#nameInput').val().trim(),
			amount: $('#sumInput').val().trim(),
			budget: $('#budgetSelect option:selected').text(),
			type: $('input[name="type"]:checked').val(),
			category: $('#categoryInput').val().trim()
		};

		if ($(`#${this.view.lang}Automate`).prop('checked')) { // Recurring transaction
			let endDate = -1;
			if (!$(`#${this.view.lang}NoEndDate`).prop('checked')) {
				endDate = dateToTimestamp($('#endDateDay').val(), $('#endDateMonth').val(), $('#endDateYear').val());
			}

			let recObj = Object.assign({
				startDate: obj.date,
				endDate: endDate,
				interval: $('#intervalSelect').val(),
				allocationOn: autoAlloc && obj.type === 'earning' && $('input[name="allocation"]:checked').val() === 'auto'
			}, obj);

			delete recObj.date;
			
			(new RecurrTrans(this.view.storage)).addRecurringTransaction(recObj);

			return; // Transaction already added, so return early and avoid adding it a second time
		}

		if (obj.type === 'earning') {
			this.transact.addEarning(obj, autoAlloc && $('input[name="allocation"]:checked').val() === 'auto');
		} else {
			this.transact.addSpending(obj);
		}
	}
}