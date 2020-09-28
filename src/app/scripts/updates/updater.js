const REPO_URL = 'https://api.github.com/repos/Malte311/FinanceList-Desktop/contents/package.json';
const LATEST_RELEASE = 'https://github.com/malte311/FinanceList-Desktop/releases/latest';

const JsonStorage = require(__dirname + '/../storage/jsonStorage.js');

const {remote} = require('electron');

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
				let pckgJson = Buffer.from(JSON.parse(body).content, 'base64').toString('ascii');
				let compareVersions = require('compare-versions');

				if (compareVersions(remote.app.getVersion(), JSON.parse(pckgJson).version) < 0) {
					Updater.showUpdateNotification();
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
		}).then(result => {
			if (result.response === 0) {
				remote.shell.openExternal(LATEST_RELEASE);
			}
		});
	}
}