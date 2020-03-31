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

			switch (btnId) {
				case 'btnAddBudget':
					dialogHandler.addBudget(modal);
					break;
			}
		});
	}

	addBudget(modal) {
		modal.find('.modal-title').html(this.view.textData['addBudget']);

		let modalTxt = this.view.textData['budgetName'];
		modal.find('.modal-body').html(this.view.elt('span', {}, modalTxt, this.view.elt('input', {
			type: 'text',
			id: 'dialogInput'
		})));
		
		modal.find('.modal-footer #modalConf').on('click', () => {
			let newBudget = $('#dialogInput').val().trim();

			this.view.storage.addToMainStorageArr('test', 'test');

			if (!this.inputHandler.isValidBudgetName(newBudget)) return;

			this.view.storage.addToMainStorageArr('budgets', [newBudget, 0.0]);
			this.view.storage.addToMainStorageArr('allTimeEarnings', [newBudget, 0.0]);
			this.view.storage.addToMainStorageArr('allTimeSpendings', [newBudget, 0.0]);
			this.view.storage.addToMainStorageArr('allocation', [newBudget, 0]);

			this.view.updateView();
		});
	}
}