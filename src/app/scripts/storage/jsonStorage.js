const fs = require('fs');
const DateHandler = require('../utils/dateHandler.js');
const Path = require('./paths.js');
const Storage = require('./storage.js');

/**
 * Class for loading and storing data on the user's computer.
 */
module.exports = class JsonStorage extends Storage {
	constructor() {
		super();

		this.defPref = Object.assign(this.defPref, {
			'fullscreen': false,
			'path': Path.getSettingsPath() + Path.sep + 'data',
			'windowSize': '1920x1080'
		});

		let currentFile = DateHandler.timestampToFilename((new Date()).getTime() / 1000);
		if (!fs.existsSync(currentFile)) {
			fs.appendFileSync(currentFile, JSON.stringify([], null, 4));
		}

		writeMainStorage('currentDate', DateHandler.getCurrentTimestamp());
	}

	/**
	 * Reads a field in the settings.json file.
	 * 
	 * @param {string} pref The name of the field we want to access.
	 * @return {string} The corresponding value of the field.
	 */
	readPreference(pref) {
		let storagePath = Path.getStoragePath();
		if (!fs.existsSync(storagePath)) { // Create storage directory if it is missing.
			Path.createPath(storagePath);
		}

		let settingsPath = Path.getSettingsFilePath();
		if (!fs.existsSync(settingsPath)) { // Create settings.json if it is missing.
			fs.appendFileSync(settingsPath, JSON.stringify(this.defPref, null, 4));
		}
		
		return JSON.parse(fs.readFileSync(settingsPath))[pref];
	}

	/**
	 * Saves a value in the settings.json file.
	 * 
	 * @param {string} name The name of the field we want to access.
	 * @param {any} value The value we want to set for the corresponding field.
	 */
	storePreference(name, value) {
		let storagePath = Path.getStoragePath();
		if (!fs.existsSync(storagePath)) { // Create storage directory if it is missing.
			Path.createPath(storagePath);
		}

		let settingsPath = Path.getSettingsFilePath();
		if (!fs.existsSync(settingsPath)) { // Create settings.json if it is missing.
			fs.appendFileSync(settingsPath, JSON.stringify(this.defPref, null, 4));
		}

		let settingsObj = JSON.parse(fs.readFileSync(settingsPath));
		settingsObj[name] = value;
		
		fs.writeFileSync(settingsPath, JSON.stringify(settingsObj, null, 4));
	}

	/**
	 * Reads a specified field in the mainStorage.json file.
	 * 
	 * @param {string} field The field we want to read.
	 * @return {string} The corresponding value for the field.
	 */
	readMainStorage(field) {
		let storagePath = readPreference('path');
		if (!fs.existsSync(storagePath)) { // Create storage directory if it is missing.
			Path.createPath(storagePath);
		}

		let mainStoragePath = storagePath + Path.sep + 'mainstorage.json';
		if (!fs.existsSync(mainStoragePath)) { // Create mainstorage.json if it is missing.
			fs.appendFileSync(mainStoragePath, JSON.stringify(this.defStor, null, 4));
		}

		return JSON.parse(fs.readFileSync(mainStoragePath))[field];
	}

	/**
	 * Writes to mainStorage.json and sets a new value for the specified field.
	 * 
	 * @param {string} field The field which value we want to set.
	 * @param {any} value The new value for the specified field.
	 */
	writeMainStorage(field, value) {
		let storagePath = readPreference('path');
		if (!fs.existsSync(storagePath)) { // Create storage directory if it is missing.
			Path.createPath(storagePath);
		}

		let mainStoragePath = storagePath + Path.sep + 'mainstorage.json';
		if (!fs.existsSync(mainStoragePath)) { // Create mainstorage.json if it is missing.
			fs.appendFileSync(mainStoragePath, JSON.stringify(this.defStor, null, 4));
		}

		let mainStorageObj = JSON.parse(fs.readFileSync(mainStoragePath));
		mainStorageObj[field] = value;
		fs.writeFileSync(mainStoragePath, JSON.stringify(mainStorageObj, null, 4));
	}

	getCurrentFileName() {
		return DateHandler.timestampToFilename(DateHandler.getCurrentTimestamp());
	}
}