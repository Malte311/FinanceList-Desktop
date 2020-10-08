/**
 * Handles entry related actions.
 */
module.exports = class Entry {
	constructor(storage) {
		this.storage = storage;
	}

	editEntry(id, newProps) {
		console.log('editEntry')
	}

	deleteEntry(id) {
		console.log('deleteEntry')
	}
}