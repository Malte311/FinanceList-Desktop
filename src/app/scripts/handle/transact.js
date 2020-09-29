module.exports = class Transact {
	constructor(storage) {
		this.storage = storage;
	}

	/**
	 * Stores a new earning entry in the corresponding data file.
	 * 
	 * @param {object} earningObj The entry to add.
	 * @param {bool} allocationOn Specifies whether the entry
	 * should be spread across multiple budgets.
	 */
	addEarning(earningObj, allocationOn) {
		if (allocationOn) {
			this.addEarningSplit(earningObj);
		} else {
			this.addEarningSingle(earningObj);
		}
	}

	/**
	 * Stores a new earning entry for a single budget.
	 * 
	 * @param {object} earningObj The entry to add.
	 */
	addEarningSingle(earningObj) {
		this.storage.storeData(earningObj);

		this.updateMainStorageArr('budgets', spendingObj.budget, spendingObj.amount);
		this.updateMainStorageArr('allTimeSpendings', spendingObj.budget, spendingObj.amount);	
	}

	/**
	 * Stores a new earning entry which is spread across multiple budgets.
	 * 
	 * @param {object} earningObj The entry to add.
	 */
	addEarningSplit(earningObj) {
		let allocation = this.storage.readMainStorage('allocation');

		let totalAmount = 0; // To avoid rounding deviations.
		allocation.forEach((budget, index) => { // budget = [name, percentage]
			if (budget[1] > 0) { // Only handle entries with percentage > 0.
				let objCopy = Object.assign({}, earningObj);
				objCopy.amount = Math.round((objCopy.amount * budget[1] / 100) * 100) / 100;
				totalAmount += objCopy.amount;

				if (index === allocation.length - 1) { // Correct deviations in the last iteration.
					objCopy.amount += (earningObj.amount - totalAmount);
				}

				this.addEarningSingle(objCopy);
			}
		});
	}

	/**
	 * Stores a new spending entry in the corresponding data file.
	 * 
	 * @param {object} spendingObj The entry to add.
	 */
	addSpending(spendingObj) {
		this.storage.storeData(spendingObj);

		this.updateMainStorageArr('budgets', spendingObj.budget, -spendingObj.amount);
		this.updateMainStorageArr('allTimeSpendings', spendingObj.budget, spendingObj.amount);
	}

	/**
	 * Updates an array in the mainstorage, i.e., reads the value for a given budget and adds a
	 * given number to it.
	 * 
	 * @param {string} arrayKey The field of the mainstorage to update
	 * (e.g. budgets, allTimeEarnings, allTimeSpendings).
	 * @param {string} budgetName The name of the budget which should be updated.
	 * @param {number} valueToAdd The number to add.
	 */
	updateMainStorageArr(arrayKey, budgetName, valueToAdd) {
		let array = this.storage.readMainStorage(arrayKey);

		array.forEach((budget, index) => { // budget = [name, amount]
			if (budget[0] === budgetName) {
				array[index][1] = Math.round((array[index][1] + valueToAdd) * 100) / 100;
			}
		});

		this.storage.writeMainStorage(arrayKey, array);
	}
}