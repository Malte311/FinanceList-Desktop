/**
 * Class for handling data requests.
 */
module.exports = class DataHandler {
	constructor(data) {
		this.data = data;
	}

	/**
	 * Returns the sum of transactions of a given type for a given budget in a specified month.
	 * 
	 * @param {string} budgetName The budget name.
	 * @param {string} type The type of the transactions (earning or spending).
	 * @param {string} [file] The name of the file in which we are searching, defaults to the
	 * file for the current month.
	 * @return {number} The sum of transactions for the given type and the given budget.
	 */
	getMonthlySum(budgetName, type, file = this.data.storage.getCurrentFilename()) {
		return this.data.getData(file, {
			connector: 'and',
			params: [['type', type], ['budget', budgetName]]
		}).reduce((prev, curr) => prev + curr.amount, 0);
	}

	getRecentTrans(limit, type) {
		return [];
	}
}