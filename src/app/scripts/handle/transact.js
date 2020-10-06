const {getCurrentTimestamp, createUniqueTimestamp} = require(__dirname + '/../utils/dateHandler.js');

/**
 * Handles (non recurring) transactions.
 */
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
		earningObj.date = createUniqueTimestamp(earningObj.date, this.storage);

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

		this.updateMainStorageArr('budgets', earningObj.budget, earningObj.amount);
		this.updateMainStorageArr('allTimeEarnings', earningObj.budget, earningObj.amount);	
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
				objCopy.budget = budget[0];
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
		spendingObj.date = createUniqueTimestamp(spendingObj.date, this.storage);

		this.storage.storeData(spendingObj);

		this.updateMainStorageArr('budgets', spendingObj.budget, -spendingObj.amount);
		this.updateMainStorageArr('allTimeSpendings', spendingObj.budget, spendingObj.amount);
	}

	/**
	 * Transfers money from one budget to another by adding transfer entries for them.
	 * 
	 * @param {string} from The budget from which money should be transferred.
	 * @param {string} to The budget to which money should be transferred.
	 * @param {number} amount The amount which should be transferred.
	 */
	addTransferEntries(from, to, amount) {
		let obj = {
			date: createUniqueTimestamp(getCurrentTimestamp(), this.storage),
			name: 'Transfer',
			amount: amount,
			category: 'Transfer'
		};

		this.addEarningSingle(Object.assign({type: 'earning', budget: to}, obj));
		this.addSpending(Object.assign({type: 'spending', budget: from}, obj));
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
				array[index][1] = Math.round((parseFloat(array[index][1]) + parseFloat(valueToAdd)) * 100) / 100;
			}
		});

		this.storage.writeMainStorage(arrayKey, array);
	}
}