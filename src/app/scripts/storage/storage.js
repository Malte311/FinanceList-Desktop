const DateHandler = require(__dirname + '/../utils/dateHandler.js');

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
			'currentDate': DateHandler.getCurrentTimestamp(),
			'allTimeEarnings': [['checking account', 0.0]],
			'allTimeSpendings': [['checking account', 0.0]],
			'allocationOn': false,
			'allocation': [['checking account', 100]],
			'recurring': [],
			'availableNames': [],
			'availableCategories': []
		};
	}

	readPreference(pref) {
		throw new Error('This function must be overridden!');
	}

	storePreference(name, value) {
		throw new Error('This function must be overridden!');
	}

	readMainStorage(field) {
		throw new Error('This function must be overridden!');
	}

	writeMainStorage(field, value) {
		throw new Error('This function must be overridden!');
	}
}