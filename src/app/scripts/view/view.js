const Data = require(__dirname + '/../data/data.js');
const DataHandler = require(__dirname + '/../data/dataHandler.js');
const Template = require(__dirname + '/templates/template.js');

/**
 * Class for displaying html templates and content.
 */
module.exports = class View {
	constructor(storage) {
		this.storage = storage;

		this.dataHandle = new DataHandler(new Data(this.storage));

		this.lang = this.storage.readPreference('language');
		this.textData = require(__dirname + `/../../text/text_${this.lang}.js`);

		this.template = new Template(this);
	}

	/**
	 * Updates the view.
	 */
	updateView() {
		throw new Error('This function must be overridden!');
	}

	/**
	 * Updates the currently selected language.
	 * 
	 * @param {string} lang The new language.
	 */
	updateLang(lang) {
		this.lang = lang;
		this.textData = require(__dirname + `/../../text/text_${this.lang}.js`);
		this.storage.storePreference('language', lang);
		this.updateView();
	}

	/**
	 * Returns the currency sign for the currently selected currency.
	 * 
	 * @return {string} An html representation of the currency sign.
	 */
	getCurrencySign() {
		switch ( this.storage.readPreference('currency')) {
			case 'Euro':
				return '\u20AC';
			case 'Dollar':
				return '\u0024';
			case 'Pound':
				return '\u00A3';
			default:
				return '\u20AC';
		}
	}

	/**
	 * Creates a new dom element.
	 * 
	 * @param {string} type The type of the new element (e.g. h1, p, div).
	 * @param {object} props Properties of the new element (e.g. {class: 'someClass'}).
	 * @param {...any} children Children of the new element (either more dom elements or
	 * the text of the new element).
	 */
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