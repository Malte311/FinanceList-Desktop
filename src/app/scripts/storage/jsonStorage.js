const {appendFileSync, existsSync, readFileSync, writeFileSync} = require('fs');
const {getCurrentTimestamp, timestampToFilename} = require(__dirname + '/../utils/dateHandler.js');
const Data = require(__dirname + '/../handle/data.js');
const Path = require(__dirname + '/paths.js');
const Storage = require(__dirname + '/storage.js');

/**
 * Class for loading and storing data on the user's computer.
 */
module.exports = class JsonStorage extends Storage {
	constructor() {
		super();

		this.data = new Data(this);

		this.defPref = Object.assign(this.defPref, {
			'fullscreen': false,
			'path': Path.getStoragePath() + Path.sep() + 'data',
			'windowSize': '1920x1080'
		});

		let currFileDir = this.readPreference('path') + Path.sep();
		if (!existsSync(currFileDir)) {
			Path.createPath(currFileDir);
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
		let storagePath = Path.getStoragePath();
		if (!existsSync(storagePath)) { // Create storage directory if it is missing.
			Path.createPath(storagePath);
		}

		let settingsPath = Path.getSettingsFilePath();
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
		let storagePath = Path.getStoragePath();
		if (!existsSync(storagePath)) { // Create storage directory if it is missing.
			Path.createPath(storagePath);
		}

		let settingsPath = Path.getSettingsFilePath();
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
		let storagePath = this.readPreference('path');
		if (!existsSync(storagePath)) { // Create storage directory if it is missing.
			Path.createPath(storagePath);
		}

		let mainStoragePath = storagePath + Path.sep() + 'mainstorage.json';
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
		let storagePath = this.readPreference('path');
		if (!existsSync(storagePath)) { // Create storage directory if it is missing.
			Path.createPath(storagePath);
		}

		let mainStoragePath = storagePath + Path.sep() + 'mainstorage.json';
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
	 * @return {object} The contents of the file (as a json object). If the file does not
	 * exist, an empty json object will be returned.
	 */
	readJsonFile(file) {
		return existsSync(file) ? JSON.parse(readFileSync(file)) : {};
	}

	/**
	 * Returns all json files which have data in it, sorted by their name (date).
	 * 
	 * @return {array} Array of the file names of all json files with data in it (with .json ending!).
	 */
	getJsonFiles() {
		return Path.listJsonFiles(this.readPreference('path'))
			.filter(e => e !== 'mainStorage.json')
			.sort((a, b) => {
				let aSplit = a.split('.');
				let bSplit = b.split('.');

				if (aSplit[1] < bSplit[1]) return -1; // Sort by year first.
				if (aSplit[1] > bSplit[1]) return  1;
				if (aSplit[0] < bSplit[0]) return -1; // Then by month.
				if (aSplit[0] > bSplit[0]) return  1;
				
				return 0;
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
	 * Checks whether a given path exists.
	 * 
	 * @param {string} path The path to be checked.
	 * @return {bool} True if the path exists, else false.
	 */
	exists(path) {
		return existsSync(path);
	}

	getData(file, quest) {
		return this.data.getData(file, quest);
	}

	storeData(data) {
		return this.data.storeData(data);
	}

	replaceData(file, data) {
		return this.data.replaceData(file, data);
	}

	deleteData(file, data) {
		return this.data.deleteData(file, data);
	}

	joinData(indices, data) {
		return this.data.joinData(indices, data);
	}
}