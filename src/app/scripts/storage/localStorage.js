const Data = require(__dirname + '/../handle/data.js');
const Storage = require(__dirname + '/storage.js');

/**
 * Class for loading and storing data in the local storage of a browser.
 */
class LocalStorage extends Storage {
	constructor() {
		super();

		this.data = new Data(this);

		/* TODO */
	}

	readPreference(pref) {
		console.log(pref)
		/* TODO */
	}

	storePreference(name, value) {
		console.log(name, value)
		/* TODO */
	}

	readMainStorage(field) {
		console.log(field)
		/* TODO */
	}

	writeMainStorage(field, value) {
		console.log(field, value)
		/* TODO */
	}

	getData(file, quest) {
		return this.data.getData(file, quest);
	}

	storeData(data) {
		console.log(data)
		/* TODO */
	}

	replaceData(file, data) {
		console.log(file, data)
		/* TODO */
	}

	deleteData(file, data) {
		console.log(file, data)
		/* TODO */
	}
}

module.exports = LocalStorage;