const Path = require(__dirname + '/../storage/paths.js');
const View = require(__dirname + '/view.js');

/**
 * Class for controling the settings page of the application.
 */
module.exports = class SettingsView extends View {
	constructor(storage) {
		super(storage);
	}

	/**
	 * Updates the view.
	 */
	updateView() {
		this.updatePreferences();
	}

	/**
	 * Displays the currently selected values for the preferences.
	 */
	updatePreferences() {
		$('#btnCurrentPath').text(this.storage.readPreference('path'));
		$('#btnCurrentCurrency').text(this.capFirstLetter(this.storage.readPreference('currency')));
		$('#btnCurrentChartType').text(this.textData[this.storage.readPreference('chartType')]);
	}

	/**
	 * Updates the path to the user data directory. In case the path changes,
	 * it moves all files from the old directory to the new location.
	 */
	updateFilepath() {
		let {dialog} = require('electron').remote;

		let oldPath = this.storage.readPreference('path');
		dialog.showOpenDialog({properties: ['openDirectory']}).then(newPath => {
			if (newPath.filePaths && newPath.filePaths[0] !== oldPath) {
				Path.moveJsonFiles(oldPath, newPath.filePaths[0], success => {
					if (!success) {
						// TODO
					} else {
						this.updatePreference('path', newPath.filePaths[0]);
					}
				});
			}
		});
	}

	/**
	 * Updates the a given preference (and displays the new value).
	 * 
	 * @param {string} name The name of the preference which should be updated.
	 * @param {string} value The new value for that preference.
	 */
	updatePreference(name, value) {
		this.storage.storePreference(name, value);

		this.updatePreferences();
	}
}