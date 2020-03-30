const Dialog = require(__dirname + '/utils/dialog.js');
const IndexView = require(__dirname + '/view/indexView.js');
const JsonStorage = require(__dirname + '/storage/jsonStorage.js');
const Updater = require(__dirname + '/updates/updater.js');

/**
 * Class for initializing the application.
 */
module.exports = class Startup {
	constructor() {
		this.storage = new JsonStorage();
		this.view = new IndexView(this.storage);

		let txt = this.view.textData;
		if (!this.storage.readPreference('user')) { // Set a username, if no user exists.
			(new Dialog(this.view)).inputDialog(txt['selUserTtitle'], txt['selUserText'], () => {
				console.log($('#dialogInput').text())
			});
		}

		Updater.checkForUpdates();
		Updater.execRecurrTransact();
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