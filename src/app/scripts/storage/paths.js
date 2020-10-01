const {sep} = require('path');

/**
 * Class for handling all things related to paths.
 */
module.exports = class Path {
	constructor(storage) {
		this.storage = storage;
	}

	/**
	 * Returns the path to the user data directory. If the script is executed in the 'npm test'
	 * environment (i.e., the --tmpdir argument is provided), the path to the tmp directory is
	 * being returned.
	 * 
	 * @return {string} The path to the user data directory.
	 */
	static home() {
		let {app} = require('electron');
		let altdir = process.argv[4] === '--tmpdir' ? '/tmp/financelist' : require('os').homedir();
		return (app !== undefined) ? app.getPath('userData') : altdir;
	}
	
	/**
	 * Returns the path separator for the currently used operating system.
	 * 
	 * @return {string} The path separator for the currently used operating system.
	 */
	static sep() {
		return sep;
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
		let {existsSync, mkdirSync} = require('fs');
		let toBeCreated = (require('os').platform() === 'win32') ? '' : '/';

		newPath.split(Path.sep()).forEach(folder => {
			if (folder.length) {
				toBeCreated += (folder + Path.sep());
				
				if (!existsSync(toBeCreated)) {
					mkdirSync(toBeCreated);
				}
			}
		});
	}

	/**
	 * Moves all json files from a source directory to a target directory.
	 * 
	 * @param {string} from The source directory.
	 * @param {string} to The target directory.
	 */
	moveJsonFiles(from, to) {
		let {readdirSync, renameSync} = require('fs');
		let allFiles = readdirSync(from);

		for (let i = 0; i < allFiles.length; i++) {
			if (allFiles[i].endsWith('.json')) {
				try {
					renameSync(from + Path.sep() + allFiles[i], to + Path.sep() + allFiles[i]);
				}
				catch (err) { // Cross-device linking will cause an error.
					let {dialog} = require('electron').remote;

					let lang = this.storage.readPreference('language');
					let textData = require(__dirname + `/../../text/text_${lang}.json`);
					
					dialog.showErrorBox(textData['error'], textData['moveFileErr']);
					break;
				}
			}
		}
	}

	/**
	 * Returns all json files in a given directory.
	 * 
	 * @param {string} dir The directory which contents we want to read.
	 * @return {array} An array containing the names of all json files in the given directory.
	 */
	static listJsonFiles(dir) {
		let {readdirSync} = require('fs');
		
		return readdirSync(dir).filter(file => file.endsWith('.json'));
	}
}