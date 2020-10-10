const DialogHandler = require(__dirname + '/utils/dialogHandler.js');
const JsonStorage = require(__dirname + '/storage/jsonStorage.js');
const RecurrTrans = require(__dirname + '/updates/recurrTrans.js');

const BalancesView = require(__dirname + '/view/balancesView.js');
const IndexView = require(__dirname + '/view/indexView.js');
const SettingsView = require(__dirname + '/view/settingsView.js');

const {checkForUpdates} = require(__dirname + '/updates/updater.js');

/**
 * Class for initializing the application.
 */
module.exports = class Startup {
	constructor() {
		this.storage = new JsonStorage();
		this.view = new IndexView(this.storage);

		this.dialogHandler = new DialogHandler(this.view);

		let txt = this.view.textData;
		if (!this.storage.readPreference('user')) { // Set a username, if no user exists.
			// (new Dialog(this.view)).inputDialog(txt['selUserTtitle'], txt['selUserText'], () => {
			// 	console.log($('#dialogInput').text())
			// });
		}

		let startUp = this; // this binding is overriden inside of the next block.
		$('#myTab a').on('click', function(e) { // Enable changing between tabs.
			e.preventDefault();
			$(this).tab('show');
			
			switch ($(this).attr('aria-controls')) {
				case 'balances':
					startUp.view = new BalancesView(startUp.storage);
					break;
				case 'overview':
					startUp.view = new IndexView(startUp.storage);
					break;
				case 'settings':
					startUp.view = new SettingsView(startUp.storage);
					break;
			}

			startUp.dialogHandler.view = startUp.view;
		});

		checkForUpdates();
		(new RecurrTrans(this.storage)).execRecurrTransact();
	}
}