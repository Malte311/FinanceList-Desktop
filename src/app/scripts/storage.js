/**
 * Class for loading and storing data.
 */
class Storage {
	constructor() {
		
	}
}

/**
 * Class for loading and storing data on the user's computer.
 */
module.exports.JsonStorage = class JsonStorage extends Storage {
	constructor() {
		super();

		this.fs = require('fs');
		this.os = require('os');
		this.path = require('path');
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

/**
 * Class for loading and storing data in the local storage of a browser.
 */
module.exports.LocalStorage = class LocalStorage extends Storage {
	constructor() {
		super();
		/* TODO */
	}
}