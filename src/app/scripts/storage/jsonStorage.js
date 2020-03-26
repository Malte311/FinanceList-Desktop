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

	readPreference(pref) {
		let storagePath = Path.getStoragePath();
		if (!fs.existsSync(storagePath)) { // Create storage directory if it is missing.
			Path.createPath(storagePath);
		}

		let settingsPath = Path.getSettingsFilePath();
		if (fs.existsSync(settingsPath)) {
			let settingsObj = JSON.parse(fs.readFileSync(settingsPath));

			if (settingsObj[pref] === undefined) {
				storePreference(pref, defPref[pref]);
				
				return defPref[pref];
			}

			return settingsObj[pref];
		}
		else { // Create settings.json if it is missing.
			fs.appendFileSync(settingsPath, JSON.stringify(defPref, null, 4));
			
			return defPref[pref];
		}
	}

	storePreference() {

	}

	readMainStorage() {

	}

	writeMainStorage() {

	}
}