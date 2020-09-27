const Data = require(__dirname + '/../handle/data.js');
const Storage = require(__dirname + '/storage.js');

/**
 * Class for loading and storing data in the local storage of a browser.
 */
module.exports = class LocalStorage extends Storage {
	constructor() {
		super();

		this.data = new Data(this);

		/* TODO */
	}

	readPreference(pref) {
		/* TODO */
	}

	storePreference(name, value) {
		/* TODO */
	}

	readMainStorage(field) {
		/* TODO */
	}

	writeMainStorage(field, value) {
		/* TODO */
	}

	getData(file, quest) {
		return this.data.getData(file, quest);
	}

	storeData(data) {
		return this.data.storeData(data);
	}

	replaceData(file, data) {
		return this.data.replaceData(file, data);
	}

	deleteData(file, data) {
		return this.data.deleteData(file, data);
	}
}