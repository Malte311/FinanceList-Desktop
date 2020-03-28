const REPO_URL = 'https://api.github.com/repos/Malte311/FinanceList-Desktop/contents/package.json';
const LATEST_RELEASE = 'https://github.com/malte311/FinanceList-Desktop/releases/latest';

const {getCurrentTimestamp} = require(__dirname + '/../utils/dateHandler.js');
const JsonStorage = require(__dirname + '/../storage/jsonStorage.js');

let jsonStorage = new JsonStorage();

/**
 * Class for notifications whenever a newer version of the application is available.
 */
module.exports = class Updater {
	/**
	 * Searches for newer versions of the application and displays a notification if a newer
	 * version exists.
	 */
	static checkForUpdates() {
		let options = {
			url: REPO_URL,
			headers: {'User-Agent': 'FinanceList-Desktop by Malte311'}
		};

		let request = require('request');
		request(options, (err, resp, body) => {
			if (!err && resp.statusCode == 200) {	
				let pckgJson = new Buffer(JSON.parse(body).content, 'base64').toString('ascii');
				let compareVersions = require('compare-versions');
				let localVersion = require('electron').remote.app.getVersion();

				if (compareVersions(localVersion, JSON.parse(pckgJson).version) < 0) {
					showUpdateNotification();
				}
			}
		});
	}

	/**
	 * Shows a notification that a newer version of this application is available.
	 */
	static showUpdateNotification() {
		let lang = jsonStorage.readPreference('language');
		let textData = require(`${__dirname}/../../text/text_${lang}.js`);
		
		let {dialog} = require('electron').remote;
		dialog.showMessageBox({
			type: 'info',
			title: textData['updateAvailable'],
			message: textData['updateMessage'],
			buttons: [
				textData['download'],
				textData['later']
			],
			cancelId: 1
		}, selectedBtn => {
			if (selectedBtn == 0) {
				require('electron').shell.openExternal(LATEST_RELEASE);
			}
		});
	}

	/**
	 * Executes all due recurring transactions.
	 */
	static execRecurrTransact() {
		let recurrTrans = jsonStorage.readMainStorage('recurring');

		for (let i = 0; i < recurrTrans.length; i++) {
			while (recurrTrans[i].nextDate <= getCurrentTimestamp()) {
				// End date not existing or not reached yet?
				if ( recurrTrans[i].endDate < 0
						|| (recurrTrans[i].endDate > 0
							&& recurrTrans[i].nextDate <= recurrTrans[i].endDate) ) {
					// Execute the correct transaction.
					// Earning? => addEarning(...)
					if ( recurrTrans[i].type === 'earning' ) {
						addEarning( recurrTrans[i].name, recurrTrans[i].amount,
									recurrTrans[i].budget, recurrTrans[i].category,
									recurrTrans[i].nextDate, recurrTrans[i].allocationOn );
					}
					// Spending? => addSpending(...)
					else if ( recurrTrans[i].type === 'spending' ) {
						addSpending( recurrTrans[i].name, recurrTrans[i].amount,
									recurrTrans[i].budget, recurrTrans[i].category,
									recurrTrans[i].nextDate );
					}
					// Update the recurring transaction entry.
					recurrTrans[i].nextDate = getNewDate( recurrTrans[i].startDate,
																	recurrTrans[i].nextDate,
																	recurrTrans[i].interval );
					// When we are done with updating, we write the new data back
					// to mainStorage.json (only the date changed).
					writeMainStorage( 'recurring', recurrTrans );
				}
				// End date reached?
				else {
					// Delete the recurring transaction.
					deleteRecurringTransaction( recurrTrans[i].name );
				}
			}
			// End date exists and got reached?
			if ( recurrTrans[i].endDate > 0
					&& recurrTrans[i].nextDate > recurrTrans[i].endDate ) {
				// Delete the recurring transaction.
				deleteRecurringTransaction( recurrTrans[i].name );
			}
		}
	}
}