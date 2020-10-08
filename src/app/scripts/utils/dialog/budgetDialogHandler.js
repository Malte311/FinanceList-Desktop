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
			if ($('#delCheck').prop('checked') && $('#delInput').val() === name) {
				this.budget.deleteBudget(name);
			} else if (this.inputHandler.isValidBudgetName($('#renInput').val().trim())) {
				this.budget.renameBudget(name, $('#renInput').val().trim());
			} else {
				// TODO: Display Error
				return;
			}

			modal.modal('hide');
			this.view.updateView();
		});

		if (this.view.storage.readMainStorage('budgets').findIndex(b => b[0] === name) !== 0) {
			$('#delDiv').show(); // Allow deleting only if the budget is not the default budget
		}
	}
}