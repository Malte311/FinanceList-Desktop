const Budget = require(__dirname + '/../../handle/budget.js');
const InputHandler = require(__dirname + '/../inputHandler.js');

/**
 * Handles all dialogs related to budgets.
 */
module.exports = class BudgetDialogHandler {
	constructor(view) {
		this.view = view;
		this.inputHandler = new InputHandler(this.view.storage);
		this.budget = new Budget(this.view.storage);
	}

	/**
	 * Displays a dialog to add a new budget and handles the interaction of this dialog.
	 */
	addBudget() {
		let modal = $('#divModal');

		modal.find('.modal-title').html(this.view.textData['addBudget']);
		modal.find('.modal-body').html(this.view.template.fromTemplate('addBudgetDialog.html'));
		
		modal.find('.modal-footer #modalConf').on('click', () => {
			let newBudget = $('#dialogInput').val().trim();
			if (!this.inputHandler.isValidBudgetName(newBudget)) {
				return;
			}

			this.budget.addBudget(newBudget);

			modal.modal('hide');
			this.view.updateView();
		});
	}

	/**
	 * Displays a dialog to rename a budget and handles the interaction of this dialog.
	 * 
	 * @param {string} name The name of the budget we want to change.
	 */
	renameBudget(name) {
		let modal = $('#divModal');

		modal.find('.modal-title').html(this.view.textData['renameBudget']);
		modal.find('.modal-body').html(this.view.template.fromTemplate('renameBudgetDialog.html')
			.replace('%%BUDGET%%', name));
		
		modal.find('.modal-footer #modalConf').on('click', () => {
			let newName = $('#dialogInput').val().trim();
			if (!this.inputHandler.isValidBudgetName(newName)) {
				return;
			}

			this.budget.renameBudget(name, newName);

			modal.modal('hide');
			this.view.updateView();
		});
	}

	/**
	 * Displays a dialog to delete a budget and handles the interaction of this dialog.
	 * 
	 * @param {string} name The name of the budget we want to delete.
	 */
	deleteBudget(name) {
		let modal = $('#divModal');

		modal.find('.modal-title').html(this.view.textData['deleteBudget']);
		modal.find('.modal-body').html(this.view.template.fromTemplate('deleteBudgetDialog.html')
			.replace('%%BUDGET%%', name));
		
		modal.find('.modal-footer #modalConf').on('click', () => {
			this.budget.deleteBudget(name);
			modal.modal('hide');
			this.view.updateView();
		});
	}
}