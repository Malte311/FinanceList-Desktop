const Path = require('./paths.js');

/**
 * Class for loading and storing data.
 */
module.exports = class Storage {
	constructor() {
		this.DateHandler = require('../utils/dateHandler.js');

		this.settingsPath = Path.getSettingsFilePath();
		this.mainstoragePath = Path.getStoragePath() + Path.sep + 'data' + Path.sep + 'mainstorage.json';

		// Default preferences object
		this.defPref = {
			'chartType': 'pie',
			'currency': 'Euro',
			'language': 'en'
		};

		// Default storage object
		this.defStor = {
			'budgets': [['checking account', 0.0]],
			'currentDate': this.DateHandler.getCurrentTimestamp(),
			'allTimeEarnings': [['checking account', 0.0]],
			'allTimeSpendings': [['checking account', 0.0]],
			'allocationOn': false,
			'allocation': [['checking account', 100]],
			'recurring': [],
			'availableNames': [],
			'availableCategories': []
		};
	}

	readPreference() {
		throw new Error('This function must be overridden!');
	}

	storePreference() {
		throw new Error('This function must be overridden!');
	}

	readMainStorage() {
		throw new Error('This function must be overridden!');
	}

	writeMainStorage() {
		throw new Error('This function must be overridden!');
	}
}