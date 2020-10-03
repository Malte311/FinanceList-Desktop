/**
 * Handles budget related things.
 */
module.exports = class Budget {
	constructor(storage) {
		this.storage = storage;
	}

	/**
	 * Adds a new budget to the array of available budgets.
	 * 
	 * @param {string} newBudget The name of the new budget.
	 */
	addBudget(newBudget) {
		['budgets', 'allTimeEarnings', 'allTimeSpendings', 'allocation'].forEach(field => {
			this.storage.addToMainStorageArr(field, [newBudget, 0]);
		});
	}

	renameBudget(name) {

	}

	deleteBudget() {

	}
}