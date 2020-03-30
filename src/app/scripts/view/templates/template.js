/**
 * Class for dealing with html templates.
 */
module.exports = class Template {
	constructor(view) {
		this.view = view;
	}

	/**
	 * Returns a fontawesome icon.
	 * 
	 * @param {string} icon The name of the icon.
	 * @param {string} [color = 'black'] The color of the icon.
	 */
	icon(icon, color = 'black') {
		return this.view.elt('i', {
			class: `${this.view.textData[icon]} text-${this.view.textData[color]}`
		});
	}

	/**
	 * Returns a progress bar.
	 * 
	 * @param {number} percentage Number between 0 and 100 which indicates the progress.
	 * @param {string} color The color of the progress bar.
	 * @param {string} [text = ''] Label which appears on the progress bar.
	 * @return {object} The progress bar in form of a dom element.
	 */
	progress(percentage, color, text = '') {
		return this.view.elt('div', {
			class: 'progress'
		}, this.view.elt('div', {
			class: `progress-bar progress-bar-striped bg-${this.view.textData[color]}`,
			role: 'progressbar',
			style: `width: ${Math.round(percentage)}%`
		}, text));
	}

	/**
	 * Returns a table of given rows.
	 * 
	 * @param {array} rows An array of strings representing the rows of the table.
	 * @return {object} The table in form of a dom element.
	 */
	table(rows) {
		return this.view.elt('table', {
			class: 'table table-striped'
		}, ...rows.map(row =>
			this.view.elt('tr', {}, ...row.map(elem =>
				this.view.elt('td', {}, elem)))));
	}

	/**
	 * Returns the html representation of a dom element in string format.
	 * 
	 * @param {object} dom The dom element.
	 * @return {string} The html representation of the dom element in string format.
	 */
	toHtmlStr(dom) {
		let tmp = document.createElement('div');
		tmp.appendChild(dom);
		return tmp.innerHTML;
	}
}