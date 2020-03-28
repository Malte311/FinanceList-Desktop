/**
 * Class for displaying html templates and content.
 */
module.exports = class View {
	constructor(storage) {
		this.storage = storage;

		let lang = this.storage.readPreference('language');
		this.textData = require(__dirname + `/../../text/text_${lang}.js`);
	}

	/**
	 * Updates the view.
	 */
	updateView() {
		throw new Error('This function must be overridden!');
	}

	/**
	 * Adds a single zero (2.5 becomes 2.50) for a more beautiful display style
	 * (only if necessary).
	 * 
	 * @param {string} amount The amount to which we want to add a zero.
	 * @return {string} The amount with an additional zero, if neccessary.
	 */
	beautifyAmount(amount) {
		if (amount.toString().indexOf('.') !== -1) {
			return amount.toString().split('.')[1].length < 2 ? `${amount}0` : amount.toString();
		}
		else {
			return `${amount}.00`;
		}
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