const {join, sep} = require('path');

/**
 * Class for handling all things related to paths.
 */
class Path {
	/**
	 * Returns the path to the user data directory. If the script is executed in the 'npm test'
	 * environment (i.e., the --tmpdir argument is provided), the path to the tmp directory is
	 * being returned.
	 * 
	 * @return {string} The path to the user data directory.
	 */
	static home() {
		// Use tmp directory for testcases
		if (process.argv[4] === '--tmpdir') {
			return '/tmp/financelist';
		}

		switch (process.platform) {
			case 'darwin':
				return join(process.env.HOME, 'Library', 'Application Support', 'FinanceList-Desktop');
			case 'linux':
				return join(process.env.HOME, '.local', 'share', 'FinanceList-Desktop');
			case 'win32':
				return join(process.env.APPDATA || require('os').homedir(), 'FinanceList-Desktop');
			default:
				return join(require('os').homedir(), 'FinanceList-Desktop');
		}
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
	 * @param {function} callback Callback function which takes one boolean parameter
	 * that indicates whether the operation succeeded or not (true = success).
	 */
	static moveJsonFiles(from, to, callback) {
		let {readdirSync, renameSync} = require('fs');
		let allFiles = readdirSync(from);

		for (let i = 0; i < allFiles.length; i++) {
			if (allFiles[i].endsWith('.json')) {
				try {
					renameSync(from + Path.sep() + allFiles[i], to + Path.sep() + allFiles[i]);
				} catch (err) { // Cross-device linking will cause an error.
					callback(false);
					break;
				}
			}
		}

		callback(true);
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

module.exports = Path;