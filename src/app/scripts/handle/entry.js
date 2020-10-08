const {createUniqueTimestamp, timestampToFilename} = require(__dirname + '/../utils/dateHandler.js');

/**
 * Handles entry related actions.
 */
module.exports = class Entry {
	constructor(storage) {
		this.storage = storage;
	}

	/**
	 * Edits a given entry.
	 * 
	 * @param {string} id The id (= date) of the entry to edit.
	 * @param {object} newProps Object containing properties with new values.
	 */
	editEntry(id, newProps) {
		// In case the date was changed: Make sure it is not already taken
		newProps.date = createUniqueTimestamp(newProps.date, this.storage);

		if (newProps.date === undefined) {
			return;
		}

		let data = this.storage.getData(timestampToFilename(id), {
			connector: 'or',
			params: [['type', 'earning'], ['type', 'spending']]
		});

		let entryIndex = data.findIndex(obj => obj.date === parseInt(id));
		if (entryIndex >= 0) {
			data[entryIndex] = Object.assign(data[entryIndex], newProps);
			this.storage.replaceData(timestampToFilename(id), data);
		}
	}

	/**
	 * Deletes a given entry.
	 * 
	 * @param {string} id The id (= date) of the entry to delete.
	 */
	deleteEntry(id) {
		this.storage.deleteData(timestampToFilename(id), id);
	}
}