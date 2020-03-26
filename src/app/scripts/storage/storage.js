/**
 * Class for loading and storing data.
 */
module.exports = class Storage {
	constructor() {
		// Default preferences object
		this.defPref = {
			'chartType': 'pie',
			'currency': 'Euro',
			'language': 'en'
		};

		// Default storage object
		this.defStor = {
			'budgets': [['checking account', 0.0]],
			'currentDate': require('../utils/dateHandler.js').getCurrentTimestamp(),
			'allTimeEarnings': [['checking account', 0.0]],
			'allTimeSpendings': [['checking account', 0.0]],
			'allocationOn': false,
			'allocation': [['checking account', 100]],
			'recurring': [],
			'availableNames': [],
			'availableCategories': []
		};
	}

	updateSettings() {
		throw new Error('This function must be overridden!');
	}
}