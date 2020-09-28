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
		return this.data.storage.getData(file, {
			connector: 'and',
			params: [['type', type], ['budget', budgetName]]
		}).reduce((prev, curr) => prev + curr.amount, 0);
	}

	/**
	 * Returns recent transactions of a given type.
	 * 
	 * @param {number} limit The limit of recent transactions to fetch.
	 * @param {string} type The type of transactions to look for (earning or spending).
	 */
	getRecentTrans(limit, type) {
		let data = [];

		let files = this.data.storage.getJsonFiles().sort((a, b) => {
			return (a.split('.').reverse().join('.') > b.split('.').reverse().join('.')) ? -1 : 1;
		});

		for (let file of files) {
			data = this.data.storage.getData(file, {
				connector: 'or',
				params: [['type', type]]
			}).concat(data);

			if (data.length >= limit) {
				break;
			}
		}

		data.sort((a, b) => a['date'] > b['date'] ? -1 : 1);
		
		return data.length > limit ? data.slice(0, limit) : data;
	}
}