const {getCurrentTimestamp} = require(__dirname + '/../utils/dateHandler.js');

/**
 * Class for loading and storing data.
 */
module.exports = class Storage {
	constructor() {
		// Default preferences object
		this.defPref = {
			'chartType': 'pie',
			'currency': 'Euro',
			'language': 'en',
			'user': null
		};

		// Default storage object
		this.defStor = {
			'budgets': [['checking account', 0.0]],
			'currentDate': getCurrentTimestamp(),
			'allTimeEarnings': [['checking account', 0.0]],
			'allTimeSpendings': [['checking account', 0.0]],
			'allocationOn': false,
			'allocation': [['checking account', 100]],
			'recurring': [],
			'availableNames': [],
			'availableCategories': []
		};
	}

	/**
	 * Reads a field in the settings.
	 * 
	 * @param {string} pref The name of the field we want to access.
	 * @return {string} The corresponding value of the field.
	 */
	readPreference(pref) {
		throw new Error('This function must be overridden!');
	}

	/**
	 * Saves a value in the settings.
	 * 
	 * @param {string} name The name of the field we want to access.
	 * @param {any} value The value we want to set for the corresponding field.
	 */
	storePreference(name, value) {
		throw new Error('This function must be overridden!');
	}

	/**
	 * Reads a specified field in the mainStorage.
	 * 
	 * @param {string} field The field we want to read.
	 * @return {string} The corresponding value for the field.
	 */
	readMainStorage(field) {
		throw new Error('This function must be overridden!');
	}

	/**
	 * Writes to the mainstorage and sets a new value for the specified field.
	 * 
	 * @param {string} field The field which value we want to set.
	 * @param {any} value The new value for the specified field.
	 */
	writeMainStorage(field, value) {
		throw new Error('This function must be overridden!');
	}

	/**
	 * Updates an array in the mainstorage: Reads the mainstorage field first, then
	 * pushes the new value to the array and writes the array back to the storage.
	 * 
	 * @param {string} field The name of a field (which contains an array!).
	 * @param {any} toAppend The element which should be appended to the array.
	 */
	addToMainStorageArr(field, toAppend) {
		let array = this.readMainStorage(field);
		array.push(toAppend);
		this.writeMainStorage(field, array);
	}

	getData(file, quest) {
		throw new Error('This function must be overridden!');
	}

	storeData(data) {
		throw new Error('This function must be overridden!');
	}

	replaceData(file, data) {
		throw new Error('This function must be overridden!');
	}

	deleteData(file, data) {
		throw new Error('This function must be overridden!');
	}
}