const Storage = require('./storage.js');

/**
 * Class for loading and storing data on the user's computer.
 */
module.exports = class JsonStorage extends Storage {
	constructor() {
		super();

		// path.join(app.getPath('userData'), 'storage');

		this.ejs = require('electron-json-storage');
		this.fs = require('fs');
		this.os = require('os');
		this.path = require('path');

		this.defPref = Object.assign(this.defPref, {
			'fullscreen': false,
			'path': this.ejs.getDefaultDataPath() + this.path.sep + 'data',
			'windowSize': '1920x1080'
		});
	}

	/**
	 * Creates the given path if it does not exist yet.
	 * 
	 * @param {string} newPath The path which should be created.
	 */
	createPath(newPath) {		
		let toBeCreated = (this.os.platform() === 'win32') ? '' : '/';

		newPath.split(this.path.sep).forEach(folder => {
			if (folder.length) {
				toBeCreated += (folder + this.path.sep);
				
				if (!this.fs.existsSync(toBeCreated)) {
					this.fs.mkdirSync(toBeCreated);
				}
			}
		});	
	}
}