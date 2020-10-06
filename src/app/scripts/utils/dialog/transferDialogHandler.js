const InputHandler = require(__dirname + '/../inputHandler.js');
const Transact = require(__dirname + '/../../handle/transact.js');

/**
 * Handles all dialogs related to transfers.
 */
module.exports = class TransferDialogHandler {
	constructor(view) {
		this.view = view;
		this.inputHandler = new InputHandler(this.view.storage);
		this.transact = new Transact(this.view.storage);
	}

	/**
	 * Displays a dialog to transfer sums and handles the interaction of this dialog.
	 */
	execTransfer() {
		let modal = $('#divModal');

		modal.find('.modal-title').html(this.view.textData['transfer']);
		modal.find('.modal-body').html(this.view.template.fromTemplate('transferDialog.html'));

		this.view.storage.readMainStorage('budgets').forEach(budget => {
			$('#fromSelect').append(new Option(budget[0], budget[0]));
			$('#toSelect').append(new Option(budget[0], budget[0]));
		});
		
		modal.find('.modal-footer #modalConf').on('click', () => {
			if (!this.inputHandler.isValidAmount($('#transferAmount').val(), false)) {
				return;
			}

			let from = $('#fromSelect option:selected').text();
			let to = $('#toSelect option:selected').text();
			
			if (from !== to) {
				this.transact.addTransferEntries(from, to, parseFloat($('#transferAmount').val()));
			}

			modal.modal('hide');
			this.view.updateView();
		});
	}
}