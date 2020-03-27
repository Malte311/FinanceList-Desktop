const fs = require('fs');
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
			fs.appendFileSync(settingsPath, JSON.stringify(defaultObj, null, 4));
		}

		let settingsObj = JSON.parse(fs.readFileSync(settingsPath));
		settingsObj[name] = value;
		
		fs.writeFileSync(settingsPath, JSON.stringify(settingsObj, null, 4));
	}

	readMainStorage() {

	}

	writeMainStorage() {

	}
}