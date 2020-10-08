const Entry = require(__dirname + '/../../handle/entry.js');
const InputHandler = require(__dirname + '/../inputHandler.js');

const {dateToTimestamp, timestampToFilename} = require(__dirname + '/../dateHandler.js');

/**
 * Handles all dialogs related to entries.
 */
module.exports = class EntryDialogHandler {
	constructor(view) {
		this.view = view;
		this.inputHandler = new InputHandler(this.view.storage);
		this.entry = new Entry(this.view.storage);
	}

	/**
	 * Displays a dialog to edit or delete an entry and handles the interaction of this dialog.
	 * 
	 * @param {number} id The date (= id) of the entry.
	 */
	editEntry(id) {
		let modal = $('#divModal');

		let entry = this.view.storage.getData(timestampToFilename(id), {
			connector: 'or',
			params: [['date', parseInt(id)]]
		})[0];		

		modal.find('.modal-title').html(this.view.textData['editEntry']);
		modal.find('.modal-body').html(this.view.template.fromTemplate('editEntryDialog.html'));

		$('#eDateYear').val((new Date(entry.date * 1000)).getFullYear());
		$('#eDateMonth').val((new Date(entry.date * 1000)).getMonth() + 1);
		$('#eDateDay').val((new Date(entry.date * 1000)).getDate());
		$('#eNameInput').val(entry.name);
		$('#eCatInput').val(entry.category);

		modal.find('.modal-footer #modalConf').on('click', () => {
			let newProps = {
				date: dateToTimestamp($('#eDateDay').val(), $('#eDateMonth').val(), $('#eDateYear').val()),
				name: $('#eNameInput').val().trim(),
				category: $('#eCatInput').val().trim()
			};

			if ($('#delCheck').prop('checked')) {
				this.entry.deleteEntry(id);
			} else if (this.inputHandler.isValidDate($('#eDateDay').val(), $('#eDateMonth').val(), $('#eDateYear').val())
					&& (newProps.name === entry.name || this.inputHandler.isValidEntryName(newProps.name))) {
				this.entry.editEntry(id, newProps);
			} else {
				// TODO: Display Error
				return;
			}

			modal.modal('hide');
			this.view.updateView();
		});
	}
}