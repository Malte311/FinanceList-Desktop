/**
 * Handles budget related things.
 */
class Budget {
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
			let data = this.storage.getData(file, {
				connector: 'or', // earning or spending gives all data
				params: [['type', 'earning'], ['type', 'spending']]
			});

			data.forEach((obj, index) => {
				if (obj.budget === oldName) {
					data[index].budget = newName;
				}
			});

			this.storage.replaceData(file, data);
		});
	}

	/**
	 * Deletes a given budget (and removes all corresponding data).
	 * 
	 * @param {string} name The name of the budget to delete.
	 */
	deleteBudget(name) {
		if (this.storage.readMainStorage('budgets').findIndex(b => b[0] === name) < 0) {
			return;
		}

		// 1. Update the mainstorage
		['budgets', 'allTimeEarnings', 'allTimeSpendings', 'allocation'].forEach(field => {
			let storageArr = this.storage.readMainStorage(field);
			
			// Make sure allocation sums up to 100 percent again (add to default budget)
			if (field === 'allocation' && storageArr.find(arr => arr[0] === name)[1] > 0) {
				storageArr[0][1] += storageArr.find(arr => arr[0] === name)[1];
			}

			storageArr = storageArr.filter(arr => arr[0] !== name);

			this.storage.writeMainStorage(field, storageArr);
		});

		// 2. Update recurring entries
		let recurring = this.storage.readMainStorage('recurring');
		recurring = recurring.filter(obj => obj.budget !== name);
		this.storage.writeMainStorage('recurring', recurring);

		// 3. Update data entries
		let files = this.storage.getJsonFiles();
		files.forEach(file => {
			let data = this.storage.getData(file, {
				connector: 'or', // Filter data for all budgets which are left after the delete
				params: [...this.storage.readMainStorage('budgets').map(b => ['budget', b[0]])]
			});

			if (!(data.length > 0)) {
				this.storage.removeFile(file);
			} else {
				this.storage.replaceData(file, data);
			}
		});
	}
}

module.exports = Budget;