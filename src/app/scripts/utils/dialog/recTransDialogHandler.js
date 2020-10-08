const RecTrans = require(__dirname + '/../../updates/recurrTrans.js');
const InputHandler = require(__dirname + '/../inputHandler.js');

/**
 * Handles all dialogs related to recurring transactions.
 */
module.exports = class RecTransDialogHandler {
	constructor(view) {
		this.view = view;
		this.inputHandler = new InputHandler(this.view.storage);
		this.recTrans = new RecTrans(this.view.storage);
	}

	/**
	 * Edits a given recurring transaction.
	 * 
	 * @param {string} id The id (= start date) of the recurring transaction.
	 */
	editRecTrans(id) {
		let modal = $('#divModal');

		modal.find('.modal-title').html(this.view.textData['editRecTrans']);
		modal.find('.modal-body').html(this.view.template.fromTemplate('editRecTransDialog.html'));

		let rt = this.view.storage.readMainStorage('recurring').find(rec => rec.startDate === parseInt(id));
		$('#rtNameInput').val(rt.name);
		$('#rtAmountInput').val(rt.amount);
		$('#rtCatInput').val(rt.category);
		$(`#rtIntervalSel option[lang=${this.view.lang}][value=${rt.interval}]`).prop('selected', true);

		if (rt.endDate !== -1) {
			$('#rtDateYear').val((new Date(rt.endDate * 1000)).getFullYear());
			$('#rtDateMonth').val((new Date(rt.endDate * 1000)).getMonth() + 1);
			$('#rtDateDay').val((new Date(rt.endDate * 1000)).getDate());
		}
		
		modal.find('.modal-footer #modalConf').on('click', () => {
			let endDate = ['#rtDateYear', '#rtDateMonth', '#rtDateDay'].some(id => $(id).val().trim() !== '') ?
				[$('#rtDateDay').val(), $('#rtDateMonth').val(), $('#rtDateYear').val()] : -1;
			
			if (!this.inputHandler.isValidEntryName($('#rtNameInput').val())
				|| !this.inputHandler.isValidAmount($('#rtAmountInput').val())
				|| (endDate !== -1 && !this.inputHandler.isValidDate(...endDate))) {
				// TODO: Display Error
				return;
			}

			let newProps = {
				name: $('#rtNameInput').val(),
				amount: parseFloat($('#rtAmountInput').val()),
				category: $('#rtCatInput').val(),
				interval: $('#rtIntervalSel option:selected').val(),
				endDate: endDate
			};

			console.log(newProps)

			if ($('#delCheck').prop('checked')) {
				this.recTrans.deleteRecurringTransaction(id);
			} else {
				this.recTrans.editRecurringTransaction(id, newProps);
			}

			return;

			modal.modal('hide');
			this.view.updateView();
		});
	}



//"editRecurringTransaction": ["Edit", "Amount", "Interval", "Update next execution"],
//"editRecurringTransaction": ["Bearbeiten", "Summe", "Intervall", "N\u00e4chste Ausf\u00fchrung anpassen"],

	// createDialog( textElementsLocal[0], content, function() {
	// 	var amountInput = $( "#recAmountInput" ).val().trim();
	// 	var intervalSelect = $( "#recIntSelect" )[0].selectedIndex;

	// 	if ( inputHandler.isValidAmount( amountInput, false ) ) {
	// 		// Something changed?
	// 		if ( amountInput != transaction.amount || intervalSelect != transaction.interval ) {
	// 			transaction.amount = parseFloat( amountInput );
	// 			transaction.interval = intervalSelect;
	// 			currentRecurringTransactions[index] = transaction;

	// 			// Write back to mainStorage.json.
	// 			writeMainStorage( "recurring", currentRecurringTransactions );
	// 			updateView();
	// 		}
	// 		$( this ).dialog( "close" );
	// 	}
	// 	else {
	// 		dialog.showErrorBox( "Error", "Invalid input" );
	// 	}
	// });

}