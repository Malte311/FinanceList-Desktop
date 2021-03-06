const Data = require(__dirname + '/../handle/data.js');
const Storage = require(__dirname + '/storage.js');

const {appendFileSync, existsSync, readFileSync, writeFileSync, unlinkSync, rmdirSync, renameSync} = require('fs');
const {getCurrentTimestamp, timestampToFilename} = require(__dirname + '/../utils/dateHandler.js');
const {createPath, getSettingsFilePath, getStoragePath, listJsonFiles, sep} = require(__dirname + '/paths.js');

/**
 * Class for loading and storing data on the user's computer.
 */
class JsonStorage extends Storage {
	constructor() {
		super();

		this.data = new Data(this);

		this.defPref = Object.assign(this.defPref, {
			'fullscreen': false,
			'path': getStoragePath() + sep() + 'data',
			'windowSize': '1920x1080'
		});

		let currFileDir = this.getDataPath();
		if (!existsSync(currFileDir)) {
			createPath(currFileDir);
		}

		let currFile = currFileDir + timestampToFilename(getCurrentTimestamp());
		if (!existsSync(currFile)) {
			appendFileSync(currFile, JSON.stringify([], null, 4));
		}

		this.writeMainStorage('currentDate', getCurrentTimestamp());
	}

	/**
	 * Reads a field in the settings.json file.
	 * 
	 * @param {string} pref The name of the field we want to access.
	 * @return {string} The corresponding value of the field.
	 */
	readPreference(pref) {
		let storagePath = getStoragePath();
		if (!existsSync(storagePath)) { // Create storage directory if it is missing.
			createPath(storagePath);
		}

		let settingsPath = getSettingsFilePath();
		if (!existsSync(settingsPath)) { // Create settings.json if it is missing.
			appendFileSync(settingsPath, JSON.stringify(this.defPref, null, 4));
		}
		
		return JSON.parse(readFileSync(settingsPath))[pref];
	}

	/**
	 * Saves a value in the settings.json file.
	 * 
	 * @param {string} name The name of the field we want to access.
	 * @param {any} value The value we want to set for the corresponding field.
	 */
	storePreference(name, value) {
		let storagePath = getStoragePath();
		if (!existsSync(storagePath)) { // Create storage directory if it is missing.
			createPath(storagePath);
		}

		let settingsPath = getSettingsFilePath();
		if (!existsSync(settingsPath)) { // Create settings.json if it is missing.
			appendFileSync(settingsPath, JSON.stringify(this.defPref, null, 4));
		}

		let settingsObj = JSON.parse(readFileSync(settingsPath));
		settingsObj[name] = value;
		
		writeFileSync(settingsPath, JSON.stringify(settingsObj, null, 4));
	}

	/**
	 * Reads a specified field in the mainStorage.json file.
	 * 
	 * @param {string} field The field we want to read.
	 * @return {string} The corresponding value for the field.
	 */
	readMainStorage(field) {
		let storagePath = this.getDataPath();
		if (!existsSync(storagePath)) { // Create storage directory if it is missing.
			createPath(storagePath);
		}

		let mainStoragePath = storagePath + sep() + 'mainstorage.json';
		if (!existsSync(mainStoragePath)) { // Create mainstorage.json if it is missing.
			appendFileSync(mainStoragePath, JSON.stringify(this.defStor, null, 4));
		}

		return JSON.parse(readFileSync(mainStoragePath))[field];
	}

	/**
	 * Writes to mainStorage.json and sets a new value for the specified field.
	 * 
	 * @param {string} field The field which value we want to set.
	 * @param {any} value The new value for the specified field.
	 */
	writeMainStorage(field, value) {
		let storagePath = this.getDataPath();
		if (!existsSync(storagePath)) { // Create storage directory if it is missing.
			createPath(storagePath);
		}

		let mainStoragePath = storagePath + sep() + 'mainstorage.json';
		if (!existsSync(mainStoragePath)) { // Create mainstorage.json if it is missing.
			appendFileSync(mainStoragePath, JSON.stringify(this.defStor, null, 4));
		}

		let mainStorageObj = JSON.parse(readFileSync(mainStoragePath));
		mainStorageObj[field] = value;
		writeFileSync(mainStoragePath, JSON.stringify(mainStorageObj, null, 4));
	}

	/**
	 * Returns the content of an arbitrary json file.
	 * 
	 * @param {string} file The full path to the json file which we want to read.
	 * @return {array} The contents of the file (as an array of objects). If the file does not
	 * exist, an empty array will be returned.
	 */
	readJsonFile(file) {
		return existsSync(file) ? JSON.parse(readFileSync(file)) : [];
	}

	/**
	 * Returns all json files which have data in it, sorted by their name (date).
	 * 
	 * @return {array} Array of the file names of all json files with data in it (with .json ending!).
	 */
	getJsonFiles() {
		return listJsonFiles(this.getDataPath())
			.filter(e => e !== 'mainstorage.json').sort((a, b) => {
				return a.split('.').reverse().join('.') < b.split('.').reverse().join('.') ? -1 : 1;
			});
	}

	/**
	 * Returns the name of the current file (with .json ending!).
	 * 
	 * @return {string} The name of the current file (with .json ending!).
	 */
	getCurrentFilename() {
		return timestampToFilename(getCurrentTimestamp());
	}

	/**
	 * Returns the path to the folder containing the data.
	 * 
	 * @return {string} The path to the folder containing the data.
	 */
	getDataPath() {
		let activeUser = this.readPreference('activeUser');
		let suffix = activeUser !== undefined ? (activeUser + sep()) : '';

		return this.readPreference('path') + sep() + suffix;
	}

	/**
	 * Checks whether a given path exists.
	 * 
	 * @param {string} path The path to be checked.
	 * @return {bool} True if the path exists, else false.
	 */
	exists(path) {
		return existsSync(path);
	}

	/**
	 * Renames a given directory.
	 * 
	 * @param {string} oldPath The name of the directory to be renamed.
	 * @param {string} newPath The new name for the directory.
	 */
	renamePath(oldPath, newPath) {
		if (existsSync(oldPath)) {
			renameSync(oldPath, newPath);
		}
	}

	/**
	 * Deletes a given directory and all of its contents.
	 * 
	 * @param {string} path The path to the directory which should be deleted.
	 */
	deletePath(path) {
		if (existsSync(path)) {
			rmdirSync(path, {recursive: true});
		}
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
		let dataPath = this.getDataPath() + file;

		if (!this.exists(dataPath)) {
			return [];
		}

		return this.data.getData(JSON.parse(readFileSync(dataPath)), quest);
	}

	/**
	 * Stores data in the appropriate data file. The file is determined by the date of the data.
	 * 
	 * @param {object} data The data we want to store.
	 */
	storeData(data) {
		let dataPath = this.getDataPath() + timestampToFilename(data.date);

		if (existsSync(dataPath)) {
			let content = JSON.parse(readFileSync(dataPath));
			content.push(data);
			writeFileSync(dataPath, JSON.stringify(this.data.sortData(content), null, 4));
		} else {
			appendFileSync(dataPath, JSON.stringify([data], null, 4));
		}
	}

	/**
	 * Replaces a specific file with new data.
	 * 
	 * @param {string} file The file to override.
	 * @param {array} data The data to write (in form of an array containing objects).
	 */
	replaceData(file, data) {
		let filePath = this.getDataPath() + file;
		
		if (existsSync(filePath)) {
			writeFileSync(filePath, JSON.stringify(data, null, 4));
		} else {
			appendFileSync(filePath, JSON.stringify(data, null, 4));
		}
	}

	/**
	 * Deletes a given entry in a given file.
	 * 
	 * @param {string} file The file which contains the data.
	 * @param {string} id The id (timestamp) of the data we want to delete.
	 */
	deleteData(file, id) {
		let dataPath = this.getDataPath() + file;

		if (!existsSync(dataPath)) {
			return;
		}

		let newContent = [];

		this.readJsonFile(dataPath).forEach(obj => {
			if (parseInt(id) !== obj.date) {
				newContent.push(obj);
			} else {
				this.removeStats(obj);
			}
		});

		writeFileSync(dataPath, JSON.stringify(newContent, null, 4));
	}

	/**
	 * After deleting an object, this function removes the object's influence on the statistics.
	 * 
	 * @param {object} obj The object which got deleted.
	 */
	removeStats(obj) {
		let budgets = this.readMainStorage('budgets');

		budgets.forEach((budget, index) => {
			if (budget[0] === obj.budget) {
				let factor = obj.type === 'earning' ? 1 : -1;
				budgets[index][1] = Math.round((budget[1] - (obj.amount * factor)) * 100) / 100;
			}
		});

		this.writeMainStorage('budgets', budgets);

		let allTime = this.readMainStorage(obj.type === 'earning' ? 'allTimeEarnings' : 'allTimeSpendings');

		allTime.forEach((trans, index) => {
			if (trans[0] === obj.budget) {
				allTime[index][1] = Math.round((trans[1] - obj.amount) * 100) / 100;
			}
		});

		this.writeMainStorage(obj.type === 'earning' ? 'allTimeEarnings' : 'allTimeSpendings', allTime);
	}

	/**
	 * Removes a given file.
	 * 
	 * @param {string} file The name of the file to remove.
	 */
	removeFile(file) {
		let dataPath = this.getDataPath() + file;

		if (existsSync(dataPath)) {
			unlinkSync(dataPath);
		}
	}
}

module.exports = JsonStorage;