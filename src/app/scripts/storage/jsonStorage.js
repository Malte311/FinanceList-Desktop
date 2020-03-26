const Storage = require('./storage.js');

/**
 * Class for loading and storing data on the user's computer.
 */
module.exports = class JsonStorage extends Storage {
	constructor() {
		super();

		this.ejs = require('electron-json-storage');
		this.fs = require('fs');
		this.os = require('os');
		this.path = require('path');

		this.defaultPreferences = Object.assign(this.defaultPreferences, {
			'fullscreen': false,
			'path': this.ejs.getDefaultDataPath() + this.path.sep + 'data',
			'windowSize': '1920x1080'
		});
	}

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