const View = require(__dirname + '/view.js');
const {moveJsonFiles} = require(__dirname + '/../storage/paths.js');

/**
 * Class for controlling the settings page of the application.
 */
class SettingsView extends View {
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
		
		$('#userOverview').html(this.template.table(
			[
				[this.textData['userProfile'], this.textData['manage']],
				...this.storage.readPreference('users').map(user => [
					this.elt('div', {}, user, (this.storage.readPreference('activeUser') === user ?
						this.template.badge(this.textData['active']) :
						this.template.link(this.template.badge(this.textData['switch'], 'gray'),
							`startup.userProfile.switchToUserProfile('${user}'); startup.view.updateView();`
						)
					)),
					this.elt('button', {
						id: 'btnEditUserProfile',
						class: 'btn btn-outline-primary',
						onclick: `$('#modalHidden').val('${user}')`,
						['data-toggle']: 'modal',
						['data-target']: '#divModal'
					}, this.template.icon('edit', 'black'))
				])
			]
		));
	}

	/**
	 * Updates the path to the user data directory. In case the path changes,
	 * it moves all files from the old directory to the new location.
	 */
	updateFilepath() {
		let {ipcRenderer} = require('electron');

		ipcRenderer.on('showOpenDialogThen', (event, newPath) => {
			let oldPath = this.storage.readPreference('path');
			if (newPath.filePaths && newPath.filePaths.length > 0 && newPath.filePaths[0] !== oldPath) {
				moveJsonFiles(oldPath, newPath.filePaths[0], success => {
					if (!success) {
						$('#set-msg').html(this.template.alert(this.textData['changePathErr']));
					} else {
						$('#set-msg').html(this.template.alert(this.textData['changeSuc'], 'green'));
						this.updatePreference('path', newPath.filePaths[0]);
					}
				});
			}
		});

		ipcRenderer.send('showOpenDialog', {properties: ['openDirectory']});
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

module.exports = SettingsView;