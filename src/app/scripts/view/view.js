const JsonStorage = require(__dirname + '/../storage/jsonStorage.js');

/**
 * Class for displaying html templates and content.
 */
module.exports = class View {
	constructor() {
		this.storage = new JsonStorage();

		let lang = this.storage.readPreference('language');
		this.textData = require(__dirname + `/../../text/text_${lang}.js`);
	}

	/**
	 * Updates the view.
	 */
	updateView() {
		throw new Error('This function must be overridden!');
	}

	elt(type, props, ...children) {
		let dom = document.createElement(type);
		
		if (props) Object.assign(dom, props);
		
		for (let child of children) {
			if (typeof child != 'string') dom.appendChild(child);
			else dom.appendChild(document.createTextNode(child));
		}

		return dom;
	}
}