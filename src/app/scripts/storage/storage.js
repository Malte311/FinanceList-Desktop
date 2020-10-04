const {getCurrentTimestamp} = require(__dirname + '/../utils/dateHandler.js');

/**
 * Class for loading and storing data.
 */
module.exports = class Storage {
	constructor() {
		// Default preferences object
		this.defPref = {
			'chartType': 'pie',
			'currency': 'euro',
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

	/**
	 * Filters data from a given file according to a given quest.
	 * 
	 * @param {string} file The file containing the data to be filtered.
	 * @param {object} quest The quest for filtering the data. quest contains a connector
	 * (or/and) and an array of parameters to filter objects. Example:
	 * quest = { connector: 'or', params: [['type', 'earning'], ['budget', 'checking account']] }
	 * @return {array} All the data which match the quest, in form of an array containing objects.
	 */
	getData(file, quest) {
		throw new Error('This function must be overridden!');
	}

	/**
	 * Stores data in the appropriate data file. The file is determined by the date of the data.
	 * 
	 * @param {object} data The data we want to store.
	 */
	storeData(data) {
		throw new Error('This function must be overridden!');
	}

	/**
	 * Replaces a specific file with new data.
	 * 
	 * @param {string} file The file to override.
	 * @param {object} data The data to write.
	 */
	replaceData(file, data) {
		throw new Error('This function must be overridden!');
	}

	/**
	 * Deletes a given entry in a given file.
	 * 
	 * @param {string} file The file which contains the data.
	 * @param {string} id The id (timestamp) of the data we want to delete.
	 */
	deleteData(file, data) {
		throw new Error('This function must be overridden!');
	}

	/**
	 * Returns the content of an arbitrary json file.
	 * 
	 * @param {string} file The full path to the json file which we want to read.
	 * @return {array} The contents of the file (as an array of objects). If the file does not
	 * exist, an empty array will be returned.
	 */
	readJsonFile(file) {
		throw new Error('This function must be overridden!');
	}

	/**
	 * Returns all json files which have data in it, sorted by their name (date).
	 * 
	 * @return {array} Array of the file names of all json files with data in it (with .json ending!).
	 */
	getJsonFiles() {
		throw new Error('This function must be overridden!');
	}

	/**
	 * Returns the name of the current file (with .json ending!).
	 * 
	 * @return {string} The name of the current file (with .json ending!).
	 */
	getCurrentFilename() {
		throw new Error('This function must be overridden!');
	}

	/**
	 * Returns the path to the folder containing the data.
	 * 
	 * @return {string} The path to the folder containing the data.
	 */
	getDataPath() {
		throw new Error('This function must be overridden!');
	}

	/**
	 * Checks whether a given path exists.
	 * 
	 * @param {string} path The path to be checked.
	 * @return {bool} True if the path exists, else false.
	 */
	exists(path) {
		throw new Error('This function must be overridden!');
	}

	/**
	 * After deleting an object, this function removes the object's influence on the statistics.
	 * 
	 * @param {object} obj The object which got deleted.
	 */
	removeStats(obj) {
		throw new Error('This function must be overridden!');
	}

		/**
	 * Removes a given file.
	 * 
	 * @param {string} file The name of the file to remove.
	 */
	removeFile(file) {
		throw new Error('This function must be overridden!');
	}
}