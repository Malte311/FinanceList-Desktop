const pathMod = require('path');

/**
 * Class for handling all things related to paths.
 */
module.exports = class Path {
	/**
	 * Returns the path to the user data directory.
	 * 
	 * @return {string} The path to the user data directory.
	 */
	static get home() {
		return require('electron').app.getPath('userData');
	}
	
	/**
	 * Returns the path separator for the currently used operating system.
	 * 
	 * @return {string} The path separator for the currently used operating system.
	 */
	static get sep() {
		return pathMod.sep;
	}

	/**
	 * Returns the path to the storage directory.
	 * 
	 * @return {string} The path to the storage directory.
	 */
	static getStoragePath() {
		return home + sep + 'storage';
	}

	/**
	 * Returns the path to the settings.json file.
	 * 
	 * @return {string} The path to the settings.json file.
	 */
	static getSettingsFilePath() {
		return getStoragePath() + sep + 'settings.json';
	}

	/**
	 * Creates the given path if it does not exist yet.
	 * 
	 * @param {string} newPath The path which should be created.
	 */
	static createPath(newPath) {
		let fs = require('fs');
		let os = require('os');
		let toBeCreated = (os.platform() === 'win32') ? '' : '/';

		newPath.split(Path.sep).forEach(folder => {
			if (folder.length) {
				toBeCreated += (folder + Path.sep);
				
				if (!fs.existsSync(toBeCreated)) {
					fs.mkdirSync(toBeCreated);
				}
			}
		});	
	}
}