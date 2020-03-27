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
	static home() {
		let app = require('electron').app;
		return (app !== undefined) ? app.getPath('userData') : require('os').homedir();
	}
	
	/**
	 * Returns the path separator for the currently used operating system.
	 * 
	 * @return {string} The path separator for the currently used operating system.
	 */
	static sep() {
		return pathMod.sep;
	}

	/**
	 * Returns the path to the storage directory.
	 * 
	 * @return {string} The path to the storage directory.
	 */
	static getStoragePath() {
		return Path.home() + Path.sep() + 'storage';
	}

	/**
	 * Returns the path to the settings.json file.
	 * 
	 * @return {string} The path to the settings.json file.
	 */
	static getSettingsFilePath() {
		return Path.getStoragePath() + Path.sep() + 'settings.json';
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

		newPath.split(Path.sep()).forEach(folder => {
			if (folder.length) {
				toBeCreated += (folder + Path.sep());
				
				if (!fs.existsSync(toBeCreated)) {
					fs.mkdirSync(toBeCreated);
				}
			}
		});	
	}
}