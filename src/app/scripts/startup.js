const Dialog = require(__dirname + '/utils/dialog.js');
const JsonStorage = require(__dirname + '/storage/jsonStorage.js');
const Updater = require(__dirname + '/updates/updater.js');

const BalancesView = require(__dirname + '/view/balancesView.js');
const HelpView = require(__dirname + '/view/helpView.js');
const IndexView = require(__dirname + '/view/indexView.js');
const SettingsView = require(__dirname + '/view/settingsView.js');

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

		let startUp = this; // this binding is overriden inside of the next block.
		$('#myTab a').on('click', function(e) { // Enable changing between tabs.
			e.preventDefault();
			$(this).tab('show');
			
			switch ($(this).attr('aria-controls')) {
				case 'balances':
					startUp.view = new BalancesView(startUp.storage);
					break;
				case 'help':
					startUp.view = new HelpView(startUp.storage);
					break;
				case 'overview':
					startUp.view = new IndexView(startUp.storage);
					break;
				case 'settings':
					startUp.view = new SettingsView(startUp.storage);
					break;
			}
		});

		Updater.checkForUpdates();
		Updater.execRecurrTransact();
	}
}