/**
 * Handles all operations on the data.
 */
module.exports = class Data {
	constructor(storage) {
		this.storage = storage;
	}

	/**
	 * Returns data from an array, filtered by a given quest.
	 * 
	 * @param {array} fileContents The contents of the array to be filtered.
	 * @param {object} quest Contains a connector (or/and) and an array of parameters to
	 * filter objects. Example:
	 * quest = { connector: 'or', params: [['type', 'earning'], ['budget', 'checking account']] }
	 * @return {array} All the data which match the quest, in form of an array containing objects.
	 */
	getData(fileContents, quest) {
		let filterFn = quest.connector === 'and' ? ((a, b) => a && b) : ((a, b) => a || b);
		
		return this.mergeData(this.getDataReduce(fileContents, quest, filterFn));
	}

	/**
	 * Does the actual filtering for the getData function.
	 * 
	 * @param {array} fileContents The content to be filtered.
	 * @param {object} quest Specifies how to filter the data.
	 * @param {function} connectFn Specifies the connector in the reduce function call. There are
	 * two cases:
	 * 1. connector: 'or' => connectFn = (a, b) => a || b
	 * 2. connector: 'and' => connectFn = (a, b) => a && b
	 * @return {array} All data which match the quest.
	 */
	getDataReduce(fileContents, quest, connectFn) {
		return fileContents.filter(dat => {
			return quest.params.reduce((prev, curr) => {
				if (curr[0] === 'name' || curr[0] === 'category') {
					var ret = dat[curr[0]].toLowerCase().includes(curr[1].toLowerCase());
				} else if (curr[0] === 'budget') {					
					var ret = dat[curr[0]].split(',').some(budget => budget.trim() === curr[1]);
				} else {
					var ret = dat[curr[0]] === curr[1];
				}

				return connectFn(prev, ret);
			}, quest.connector === 'and');
		});
	}

	/**
	 * Displays partitioned entries as one entry. This is only necessary for earnings, since
	 * spendings cannot be partitioned.
	 * 
	 * @param {array} data An array containing data which might need to be merged.
	 */
	mergeData(data) {
		let newData = [];
		const range = (from, to) => [...Array(to - from + 1).keys()].map(e => e + from);

		for (let i = 0; i < data.length - 1; i++) {
			let startIndex = i;
			
			// The timestamp acts as an identifier since it is unique (data is sorted by time).
			while (i < data.length - 1 && data[i].date === data[i + 1].date) {
				i++;
			}

			newData.push(this.joinData(range(startIndex, i), data));
		}

		return newData;
	}

	/**
	 * Joins entries to one entry (just for a nicer display style, the storage remains unchanged).
	 * 
	 * @param {array} indices The indices we want to join (this array must not be empty).
	 * @param {object} data Data object which contains the entries.
	 * @return {object} The data with joined entries.
	 */
	joinData(indices, data) {
		if (indices.length < 1) {
			return {};
		}

		let newDataEntry = data[indices[0]];
		for (let i = 1; i < indices.length; i++) {
			newDataEntry.budget += `, ${data[indices[i]].budget}`;
			newDataEntry.amount = Math.round((newDataEntry.amount + data[indices[i]].amount) * 100) / 100;
		}

		newDataEntry.budget = newDataEntry.budget.split(', ').sort().join(', ');

		return newDataEntry;
	}

	/**
	 * Sorts data by date (oldest first). Note that each entry has a unique date.
	 * 
	 * @param {array} data The data we want to sort (in form of an array of objects).
	 * @return {array} The sorted data.
	 */
	sortData(data) {
		return data.sort((a, b) => a['date'] < b['date'] ? -1 : 1);
	}
}