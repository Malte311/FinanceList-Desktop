const AllocationDialogHandler = require(__dirname + '/allocationDialogHandler.js');
const EntryDialogHandler = require(__dirname + '/entryDialogHandler.js');
const RecTransDialogHandler = require(__dirname + '/recTransDialogHandler.js');
const TransactDialogHandler = require(__dirname + '/transactDialogHandler.js');
const TransferDialogHandler = require(__dirname + '/transferDialogHandler.js');

const InputHandler = require(__dirname + '/../inputHandler.js');

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
					dialogHandler.addBudgetDialog();
					break;
				case 'btnAddTransact':
					(new TransactDialogHandler(dialogHandler.view)).addTransaction();
					break;
				case 'btnEditBudget':
					dialogHandler.editBudget($('#modalHidden').val());
					break;
				case 'btnEditEntry':
					(new EntryDialogHandler(dialogHandler.view)).editEntry($('#modalHidden').val());
					break;
				case 'btnEditRecTrans':
					(new RecTransDialogHandler(dialogHandler.view)).editRecTrans($('#modalHidden').val());
					break;
				case 'btnTransfer':
					(new TransferDialogHandler(dialogHandler.view)).execTransfer();
					break;
				case 'btnSetAlloc':
					(new AllocationDialogHandler(dialogHandler.view)).setAllocation();
					break;
			}

			$(`[lang=${dialogHandler.view.lang}]`).show();
		});
	}

	/**
	 * Displays a dialog.
	 * 
	 * @param {string} title The title of the dialog.
	 * @param {string} text The content of the dialog.
	 * @param {function} [callback] A callback function which is executed after clicking
	 * the confirm button in the dialog.
	 */
	displayDialog(title, text, callback = () => true) {
		let modal = $('#divModal');

		modal.find('.modal-title').html(title);
		modal.find('.modal-err').html('');
		modal.find('.modal-body').html(text);
		
		modal.find('.modal-footer #modalConf').on('click', () => {
			if (callback()) {
				modal.modal('hide');
				this.view.updateView();
			}
		});
	}

	/**
	 * Displays an error message in the currently open dialog.
	 * 
	 * @param {string} msg The message to display.
	 * @param {string} [color = 'red'] The color of the alert.
	 */
	displayErrorMsg(msg, color = 'red') {
		let modal = $('#divModal');

		modal.find('.modal-err').html(this.view.template.alert(msg, color));
	}

	/**
	 * Displays a dialog to add a new budget and handles the interaction of this dialog.
	 */
	addBudgetDialog() {
		let title = this.view.textData['addBudget'];
		let text = this.view.template.fromTemplate('addBudgetDialog.html');
		
		this.displayDialog(title, text, () => {
			let newBudget = $('#dialogInput').val().trim();
			if (!this.inputHandler.isValidBudgetName(newBudget)) {
				let msgTxt = this.view.textData['invalidBudgetName'];
				this.displayErrorMsg(msgTxt.replace(/%%MAXLEN%%/g, this.inputHandler.maxSwLen));
				return false;
			}

			const Budget = require(__dirname + '/../../handle/budget.js');
			(new Budget(this.view.storage)).addBudget(newBudget);

			return true;
		});
	}
}