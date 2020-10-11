const {getCurrentTimestamp} = require(__dirname + '/../utils/dateHandler.js');

/**
 * Class for loading and storing data.
 */
class Storage {
	constructor() {
		let user = require('os').userInfo().username;

		// Default preferences object
		this.defPref = {
			'activeUser': user,
			'chartType': 'pie',
			'currency': 'euro',
			'language': 'en',
			'users': [user]
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
	 */
	readPreference() {
		throw new Error('This function must be overridden!');
	}

	/**
	 * Saves a value in the settings.
	 */
	storePreference() {
		throw new Error('This function must be overridden!');
	}

	/**
	 * Reads a specified field in the mainStorage.
	 */
	readMainStorage() {
		throw new Error('This function must be overridden!');
	}

	/**
	 * Writes to the mainstorage and sets a new value for the specified field.
	 */
	writeMainStorage() {
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

	/**
	 * Filters data from a given file according to a given quest.
	 */
	getData() {
		throw new Error('This function must be overridden!');
	}

	/**
	 * Stores data in the appropriate data file. The file is determined by the date of the data.
	 */
	storeData() {
		throw new Error('This function must be overridden!');
	}

	/**
	 * Replaces a specific file with new data.
	 */
	replaceData() {
		throw new Error('This function must be overridden!');
	}

	/**
	 * Deletes a given entry in a given file.
	 */
	deleteData() {
		throw new Error('This function must be overridden!');
	}

	/**
	 * Returns the content of an arbitrary json file.
	 */
	readJsonFile() {
		throw new Error('This function must be overridden!');
	}

	/**
	 * Returns all json files which have data in it, sorted by their name (date).
	 */
	getJsonFiles() {
		throw new Error('This function must be overridden!');
	}

	/**
	 * Returns the name of the current file (with .json ending!).
	 */
	getCurrentFilename() {
		throw new Error('This function must be overridden!');
	}

	/**
	 * Returns the path to the folder containing the data.
	 */
	getDataPath() {
		throw new Error('This function must be overridden!');
	}

	/**
	 * Checks whether a given path exists.
	 */
	exists() {
		throw new Error('This function must be overridden!');
	}

	/**
	 * Renames a given directory.
	 */
	renamePath() {
		throw new Error('This function must be overridden!');
	}

	/**
	 * Deletes a given directory and all of its contents.
	 */
	deletePath() {
		throw new Error('This function must be overridden!');
	}

	/**
	 * After deleting an object, this function removes the object's influence on the statistics.
	 */
	removeStats() {
		throw new Error('This function must be overridden!');
	}

	/**
	 * Removes a given file.
	 */
	removeFile() {
		throw new Error('This function must be overridden!');
	}
}

module.exports = Storage;