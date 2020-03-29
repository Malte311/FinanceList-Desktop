/**
 * Class for displaying dialogs.
 */
module.exports = class Dialog {
	constructor(view) {
		this.view = view;
	}

	/**
	 * Creates a dialog with the given attributes.
	 * 
	 * @param {string} id The id of the dom element which contains the dialog.
	 * @param {string} title The title of the dialog.
	 * @param {string} text The content of the dialog.
	 * @param {function} [okFunc] A function which is executed when the confirm button was pressed.
	 */
	createDialog(id, title, text, okFunc) {
		$(id).html(text);

		$(id).dialog({
			resizable: false,
			height: 'auto',
			width: 'auto',
			minWidth: 200,
			minHeight: 150,
			modal: true,
			title: title,
			close: function () {
				$(id).html('');
			},
			buttons: [
				{
					text: this.view.textData['confirm'],
					click: function() {
						typeof okFunc === 'function' && okFunc();
						$(this).dialog('close');
					}
				},
				{
					text: this.view.textData['cancel'],
					click: function() {
						$(this).dialog('close');
					}
				}
			]
		});
	}

	inputDialog(title, text, okFunc) {
		let input = this.view.elt('input', {id: 'dialogInput'});
		this.createDialog('#dialogDiv', title, input, okFunc);
	}
}