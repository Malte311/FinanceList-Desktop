const Data = require(__dirname + '/../handle/data.js');
const DataHandler = require(__dirname + '/../handle/dataHandler.js');
const Template = require(__dirname + '/template.js');

/**
 * Class for displaying html templates and content.
 */
class View {
	/**
	 * @param {Storage} storage Storage object.
	 */
	constructor(storage) {
		this.storage = storage;

		this.dataHandle = new DataHandler(new Data(this.storage));

		this.lang = this.storage.readPreference('language');
		this.textData = require(__dirname + `/../../text/text_${this.lang}.js`);
		
		$(`[lang=${this.lang}]`).show();

		this.mappings = require(__dirname + '/../../text/mappings.js');
		this.template = new Template(this);

		this.updateView();
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
		$(`[lang=${this.lang}]`).hide();
		$(`[lang=${lang}]`).show();
		
		this.lang = lang;
		this.textData = require(__dirname + `/../../text/text_${this.lang}.js`);
		this.storage.storePreference('language', lang);

		this.updateView();
	}

	/**
	 * Returns the string representation of a number for displaying it.
	 * (The display version has two decimal places and a currency sign)
	 * 
	 * @param {number} num The number which should be displayed.
	 * @return {string} The display representation of that number.
	 */
	printNum(num) {
		return parseFloat(num).toFixed(2) + this.mappings[this.storage.readPreference('currency')];
	}

	/**
	 * Capitalizes the first letter of a word.
	 * 
	 * @param {string} str The word which should be capitalized.
	 */
	capFirstLetter(str) {
		return str.charAt(0).toUpperCase() + str.slice(1);
	}

	/**
	 * Creates a new dom element.
	 * 
	 * @param {string} type The type of the new element (e.g. h1, p, div).
	 * @param {object} attrs Attributes of the new element (e.g. {class: 'someClass'}).
	 * @param {...any} children Children of the new element (either more dom elements or
	 * the text of the new element).
	 */
	elt(type, attrs, ...children) {
		let dom = document.createElement(type);
		
		for (let attr of Object.keys(attrs)) {
			dom.setAttribute(attr, attrs[attr]);
		}
		
		for (let child of children) {
			if (typeof child != 'string') dom.appendChild(child);
			else dom.appendChild(document.createTextNode(child));
		}

		return dom;
	}

	/**
	 * Creates a datepicker on a given dom element.
	 * 
	 * @param {string} id The id of the dom element.
	 * @param {array} elems Array of three inputs (year, month, day) in which the chosen value
	 * will be displayed.
	 * @param {Date} [minDate = null] Minimum date which can be selected.
	 */
	createDatepicker(id, elems, minDate = null) {
		$(id).datepicker('dialog', `${$(elems[0]).val()}-${$(elems[1]).val()}-${$(elems[2]).val()}`,
		function(v, o) {
			$(elems[0]).val(o.selectedYear);
			$(elems[1]).val(o.selectedMonth + 1);
			$(elems[2]).val(o.selectedDay);
		}, {
			minDate: minDate,
			dateFormat: "yy-mm-dd",
			dayNames: this.textData['dayNames'],
			dayNamesMin: this.textData['dayNamesMin'],
			dayNamesShort: this.textData['dayNamesShort'],
			firstDay: 1,
			monthNames: this.textData['monthNames'],
			monthNamesShort: this.textData['monthNamesShort'],
		});
	}

	/**
	 * Inspired by https://www.w3schools.com/howto/howto_js_sort_table.asp.
	 * Sorts a table by a given column id.
	 * 
	 * @param {string} table The id of the table.
	 * @param {number} n The number which specifies the column to sort by:
	 * 0: Date
	 * 1: Name
	 * 2: Sum
	 * 3: Category
	 * 4: Budget
	 * 5: Type
	 */
	sortTableByColumn(table, n) {
		let rows = document.getElementById(table).rows, x, y,
			shouldSwitch, dir = 'asc', switchCount = 0, switching = true;

		while (switching) {
			switching = false;

			for (var i = 1; i < (rows.length - 1); i++) {
				shouldSwitch = false;

				x = rows[i].getElementsByTagName('TD')[n];
				y = rows[i + 1].getElementsByTagName('TD')[n];

				let a = n === 0 ? x.innerHTML.toLowerCase().split('.').reverse().join('.') :
					(n === 2 ? parseFloat(x.innerHTML.toLowerCase()) : x.innerHTML.toLowerCase());
				let b = n === 0 ? y.innerHTML.toLowerCase().split('.').reverse().join('.') :
					(n === 2 ? parseFloat(y.innerHTML.toLowerCase()) : y.innerHTML.toLowerCase());
				if ((dir === 'asc' && a > b) || (dir === 'desc' && b > a)) {
					shouldSwitch = true;
					break;
				}
			}

			if (shouldSwitch) {
				rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
				switching = true;
				switchCount ++;
			} else if (switchCount == 0 && dir === 'asc') {
				dir = 'desc';
				switching = true;
			}
		}
	}
}

module.exports = View;