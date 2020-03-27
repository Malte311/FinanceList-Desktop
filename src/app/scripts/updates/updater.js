const REPO_URL = 'https://api.github.com/repos/Malte311/FinanceList-Desktop/contents/package.json';
const LATEST_RELEASE = 'https://github.com/malte311/FinanceList-Desktop/releases/latest';

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
		let textdata = require(__dirname + '/../text/updates_' + getLanguage() + '.json.js');
		
		let { dialog } = require('electron').remote;
		dialog.showMessageBox({
			type: 'info',
			title: textdata['updateAvailable'],
			message: textdata['updateMessage'],
			buttons: [
				textdata['download'],
				textdata['later']
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
		let DateHandler = require(__dirname + '/../utils/dateHandler.js');
		// Get recurring transactions to iterate over them.
		var recurringTransactions = readMainStorage( 'recurring' );
		// Iterate over all recurring transactions to check if we need to execute a transaction.
		for ( var i = 0; i < recurringTransactions.length; i++ ) {
			// Date less/equal today?
			// We want to use 'while' instead of 'if', here is an example why:
			// Transaction should occur on 01.01.2020 and has a monthly interval.
			// The user does not log in until 03.04.2020.
			// Now the transaction needs to be executed multiple times, not just once.
			while ( recurringTransactions[i].nextDate <= DateHandler.getCurrentTimestamp() ) {
				// End date not existing or not reached yet?
				if ( recurringTransactions[i].endDate < 0
						|| (recurringTransactions[i].endDate > 0
							&& recurringTransactions[i].nextDate <= recurringTransactions[i].endDate) ) {
					// Execute the correct transaction.
					// Earning? => addEarning(...)
					if ( recurringTransactions[i].type === 'earning' ) {
						addEarning( recurringTransactions[i].name, recurringTransactions[i].amount,
									recurringTransactions[i].budget, recurringTransactions[i].category,
									recurringTransactions[i].nextDate, recurringTransactions[i].allocationOn );
					}
					// Spending? => addSpending(...)
					else if ( recurringTransactions[i].type === 'spending' ) {
						addSpending( recurringTransactions[i].name, recurringTransactions[i].amount,
									recurringTransactions[i].budget, recurringTransactions[i].category,
									recurringTransactions[i].nextDate );
					}
					// Update the recurring transaction entry.
					recurringTransactions[i].nextDate = getNewDate( recurringTransactions[i].startDate,
																	recurringTransactions[i].nextDate,
																	recurringTransactions[i].interval );
					// When we are done with updating, we write the new data back
					// to mainStorage.json (only the date changed).
					writeMainStorage( 'recurring', recurringTransactions );
				}
				// End date reached?
				else {
					// Delete the recurring transaction.
					deleteRecurringTransaction( recurringTransactions[i].name );
				}
			}
			// End date exists and got reached?
			if ( recurringTransactions[i].endDate > 0
					&& recurringTransactions[i].nextDate > recurringTransactions[i].endDate ) {
				// Delete the recurring transaction.
				deleteRecurringTransaction( recurringTransactions[i].name );
			}
		}
	}
}