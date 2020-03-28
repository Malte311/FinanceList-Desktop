const Data = require(__dirname + '/../data/data.js');
const Storage = require(__dirname + '/storage.js');

/**
 * Class for loading and storing data in the local storage of a browser.
 */
module.exports = class LocalStorage extends Storage {
	constructor() {
		super();
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
		return (new Data(this)).getData(file, quest);
	}

	storeData(data) {
		return (new Data(this)).storeData(data);
	}

	replaceData(file, data) {
		return (new Data(this)).replaceData(file, data);
	}

	deleteData(file, data) {
		return (new Data(this)).deleteData(file, data);
	}

	joinData(indices, data) {
		return (new Data(this)).joinData(indices, data);
	}
}