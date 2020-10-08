const AllocationDialogHandler = require(__dirname + '/allocationDialogHandler.js');
const BudgetDialogHandler = require(__dirname + '/budgetDialogHandler.js');
const TransactDialogHandler = require(__dirname + '/transactDialogHandler.js');
const TransferDialogHandler = require(__dirname + '/transferDialogHandler.js');

/**
 * Class for handling all kinds of dialogs.
 */
module.exports = class DialogHandler {
	constructor(view) {
		this.view = view;

		let dialogHandler = this; // this binding will be overridden in the upcoming block.
		$('#divModal').on('show.bs.modal', function(event) {
			let btnId = $(event.relatedTarget).attr('id'); // Button that triggered the modal.

			let modal = $(this);
			modal.find('.modal-footer #modalCanc').html(dialogHandler.view.textData['cancel']);
			modal.find('.modal-footer #modalConf').html(dialogHandler.view.textData['confirm']);
			modal.find('.modal-footer #modalConf').off(); // Remove previous listener.

			switch (btnId) {
				case 'btnAddBudget':
					(new BudgetDialogHandler(dialogHandler.view)).addBudget();
					break;
				case 'btnAddTransact':
					(new TransactDialogHandler(dialogHandler.view)).addTransaction();
					break;
				case 'btnEditBudget':
					(new BudgetDialogHandler(dialogHandler.view)).editBudget($('#modalHidden').val());
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
}