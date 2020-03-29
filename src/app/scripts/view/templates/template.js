/**
 * Class for dealing with html templates.
 */
module.exports = class Template {
	constructor(view) {
		this.view = view;
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
			class: `progress-bar progress-bar-striped bg-${this.mapColor(color)}`,
			role: 'progressbar',
			style: `width: ${Math.round(percentage)}%`
		}, text));
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

	/**
	 * Maps colornames (e.g. blue, green, red) to bootstrap colors.
	 * 
	 * @param {string} color The color we want to map.
	 * @return {string} The mapped color. 
	 */
	mapColor(color) {
		switch (color) {
			case 'blue':
				return 'primary';
			case 'gray':
				return 'secondary';
			case 'green':
				return 'success';
			case 'red':
				return 'danger';
			case 'yellow':
				return 'warning';
			default:
				return 'primary';
		}
	}
}