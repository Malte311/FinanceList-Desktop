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
	 * @param {string} [text = ''] Label which appears on the progress bar.
	 * @return {object} The progress bar in form of a dom element.
	 */
	progress(percentage, text = '') {
		return this.view.elt('div', {
			class: 'progress'
		}, this.view.elt('div', {
			class: 'progress-bar progress-bar-striped',
			role: 'progressbar',
			style: `width: ${percentage}%`
		}, text));
	}
}