const IndexView = require(__dirname + '/view/indexView.js');
const JsonStorage = require(__dirname + '/storage/jsonStorage.js');
const Updater = require(__dirname + '/updates/updater.js');

/**
 * Class for initializing the application.
 */
module.exports = class Startup {
	constructor() {
		this.storage = new JsonStorage();

		Updater.checkForUpdates();
		Updater.execRecurrTransact();
	
		this.view = new IndexView(this.storage);
	}

	/**
	 * Updates the currently selected view.
	 * 
	 * @param {object} view The new view object.
	 */
	setView(view) {
		this.view = view;
	}
}