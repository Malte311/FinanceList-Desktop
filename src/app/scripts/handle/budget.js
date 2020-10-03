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

	/**
	 * Renames a given budget (replaces its name with a new name).
	 * 
	 * @param {string} oldName The old name of the budget.
	 * @param {string} newName The new name of the budget.
	 */
	renameBudget(oldName, newName) {
		// 1. Update the mainstorage
		['budgets', 'allTimeEarnings', 'allTimeSpendings', 'allocation'].forEach(field => {
			let storageArr = this.storage.readMainStorage(field);
			storageArr.forEach((entry, index) => {
				if (entry[0] === oldName) {
					storageArr[index][0] = newName;
				}
			});
			this.storage.writeMainStorage(field, storageArr);
		});

		// 2. Update recurring entries
		let recurring = this.storage.readMainStorage('recurring');
		recurring.forEach((trans, index) => {
			if (trans.budget === oldName) {
				recurring[index].budget = newName;
			}
		});
		this.storage.writeMainStorage('recurring', recurring);

		// 3. Update data entries
		let files = this.storage.getJsonFiles();
		files.forEach(file => {
			let data = this.storage.getData(`${file}.json`, {
				connector: 'or', // earning or spending gives all data
				params: [['type', 'earning'], ['type', 'spending']]
			});

			
		});
	}

	deleteBudget() {

	}
}