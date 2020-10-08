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
	 * Displays a dialog to edit or delete a budget and handles the interaction of this dialog.
	 * 
	 * @param {string} name The name of the budget we want to edit/delete.
	 */
	editBudget(name) {
		let modal = $('#divModal');

		modal.find('.modal-title').html(this.view.textData['editBudget']);
		modal.find('.modal-body').html(this.view.template.fromTemplate('editBudgetDialog.html')
			.replace(/%%BUDGET%%/g, name));
		
		modal.find('.modal-footer #modalConf').on('click', () => {
			console.log("click")
			if ($('#delCheck').checked && $('#delInput') === name) {
				console.log("Delete")
			} else if (this.inputHandler.isValidBudgetName($('#renInput').val().trim())) {
				console.log("Rename")
			}
			return;

			// let newName = $('#renInput').val().trim();
			// if (!this.inputHandler.isValidBudgetName(newName)) {
			// 	return;
			// }

			// this.budget.renameBudget(name, newName);

			// 	this.budget.deleteBudget(name);

			modal.modal('hide');
			this.view.updateView();
		});

		modal.modal('show');
	}
}