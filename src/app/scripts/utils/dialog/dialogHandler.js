const RecTransDialogHandler = require(__dirname + '/recTransDialogHandler.js');
const TransactDialogHandler = require(__dirname + '/transactDialogHandler.js');
const TransferDialogHandler = require(__dirname + '/transferDialogHandler.js');

const InputHandler = require(__dirname + '/../inputHandler.js');
const {dateToTimestamp, timestampToFilename} = require(__dirname + '/../dateHandler.js');

/**
 * Class for handling all kinds of dialogs.
 */
module.exports = class DialogHandler {
	constructor(view) {
		this.view = view;
		this.inputHandler = new InputHandler(this.view.storage);

		let dialogHandler = this; // this binding will be overridden in the upcoming block.
		$('#divModal').on('show.bs.modal', function(event) {
			let btnId = $(event.relatedTarget).attr('id'); // Button that triggered the modal.

			let modal = $(this);
			modal.find('.modal-footer #modalCanc').html(dialogHandler.view.textData['cancel']);
			modal.find('.modal-footer #modalConf').html(dialogHandler.view.textData['confirm']);
			modal.find('.modal-footer #modalConf').off(); // Remove previous listener.

			switch (btnId) {
				case 'btnAddBudget':
					dialogHandler.addBudgetDialog();
					break;
				case 'btnAddTransact':
					(new TransactDialogHandler(dialogHandler.view)).addTransaction();
					break;
				case 'btnEditBudget':
					dialogHandler.editBudgetDialog($('#modalHidden').val());
					break;
				case 'btnEditEntry':
					dialogHandler.editEntryDialog($('#modalHidden').val());
					break;
				case 'btnEditRecTrans':
					(new RecTransDialogHandler(dialogHandler.view)).editRecTrans($('#modalHidden').val());
					break;
				case 'btnTransfer':
					(new TransferDialogHandler(dialogHandler.view)).execTransfer();
					break;
				case 'btnSetAlloc':
					dialogHandler.setAllocationDialog();
					break;
			}

			$(`[lang=${dialogHandler.view.lang}]`).show();
		});
	}

	/**
	 * Displays a dialog.
	 * 
	 * @param {string} title The title of the dialog.
	 * @param {string} text The content of the dialog.
	 * @param {function} [callback] A callback function which is executed after clicking
	 * the confirm button in the dialog.
	 */
	displayDialog(title, text, callback = () => true) {
		let modal = $('#divModal');

		modal.find('.modal-title').html(title);
		modal.find('.modal-err').html('');
		modal.find('.modal-body').html(text);
		
		modal.find('.modal-footer #modalConf').on('click', () => {
			if (callback()) {
				modal.modal('hide');
				this.view.updateView();
			}
		});
	}

	/**
	 * Displays an error message in the currently open dialog.
	 * 
	 * @param {string} msg The message to display.
	 * @param {string} [color = 'red'] The color of the alert.
	 */
	displayErrorMsg(msg, color = 'red') {
		let modal = $('#divModal');

		modal.find('.modal-err').html(this.view.template.alert(msg, color));
	}

	/**
	 * Displays a dialog to add a new budget and handles the interaction of this dialog.
	 * 
	 * @return {bool} True if the input is valid, else false.
	 */
	addBudgetDialog() {
		let title = this.view.textData['addBudget'];
		let text = this.view.template.fromTemplate('addBudgetDialog.html');
		
		this.displayDialog(title, text, () => {
			let newBudget = $('#dialogInput').val().trim();
			if (!this.inputHandler.isValidBudgetName(newBudget)) {
				let msgTxt = this.view.textData['invalidBudgetName'];
				this.displayErrorMsg(msgTxt.replace(/%%MAXLEN%%/g, this.inputHandler.maxSwLen));
				return false;
			}

			const Budget = require(__dirname + '/../../handle/budget.js');
			(new Budget(this.view.storage)).addBudget(newBudget);

			return true;
		});
	}


	/**
	 * Displays a dialog to edit or delete a budget and handles the interaction of this dialog.
	 * 
	 * @param {string} name The name of the budget we want to edit/delete.
	 * @return {bool} True if the input is valid, else false.
	 */
	editBudgetDialog(name) {
		let title = this.view.textData['editBudget'];
		let text = this.view.template.fromTemplate('editBudgetDialog.html');

		this.displayDialog(title, text.replace(/%%BUDGET%%/g, name), () => {
			const Budget = require(__dirname + '/../../handle/budget.js');

			if ($('#delCheck').prop('checked') && $('#delInput').val() === name) {
				(new Budget(this.view.storage)).deleteBudget(name);
			} else if ($('#delCheck').prop('checked')) {
				this.displayErrorMsg(this.view.textData['invalidCheckInput']);
				return false;
			} else if (this.inputHandler.isValidBudgetName($('#renInput').val().trim())) {
				(new Budget(this.view.storage)).renameBudget(name, $('#renInput').val().trim());
			} else {
				let msgTxt = this.view.textData['invalidBudgetName'];
				this.displayErrorMsg(msgTxt.replace(/%%MAXLEN%%/g, this.inputHandler.maxSwLen));
				return false;
			}

			return true;
		});

		if (this.view.storage.readMainStorage('budgets').findIndex(b => b[0] === name) !== 0) {
			$('#delDiv').show(); // Allow deleting only if the budget is not the default budget
		}
	}

	/**
	 * Displays a dialog to edit or delete an entry and handles the interaction of this dialog.
	 * 
	 * @param {number} id The date (= id) of the entry.
	 * @return {bool} True if the input is valid, else false.
	 */
	editEntryDialog(id) {
		let title = this.view.textData['editEntry'];
		let text = this.view.template.fromTemplate('editEntryDialog.html');
		let entry = this.view.storage.getData(timestampToFilename(id), {
			connector: 'or',
			params: [['date', parseInt(id)]]
		})[0];
		
		this.displayDialog(title, text, () => {
			let d = $('#eDateDay').val(), m = $('#eDateMonth').val(), y = $('#eDateYear').val();
			let o = {
				date: dateToTimestamp(d, m, y),
				name: $('#eNameInput').val().trim(),
				category: $('#eCatInput').val().trim()
			};

			const Entry = require(__dirname + '/../../handle/entry.js');
			if ($('#delCheck').prop('checked')) {
				(new Entry(this.view.storage)).deleteEntry(id);
			} else if (!this.inputHandler.isValidDate(d, m, y)) {
				this.displayErrorMsg(this.view.textData['invalidDateInput']);
				return false;
			} else if (o.name !== entry.name && !this.inputHandler.isValidEntryName(o.name)) {
				let msg = this.view.textData['invalidEntryName']
					.replace(/%%MAXLEN%%/g, this.inputHandler.maxStrLen)
					.replace(/%%MAXWLEN%%/g, this.inputHandler.maxSwLen);
				this.displayErrorMsg(msg);
				return false;
			} else {
				(new Entry(this.view.storage)).editEntry(id, o);
			}

			return true;
		});

		$('#eDateYear').val((new Date(entry.date * 1000)).getFullYear());
		$('#eDateMonth').val((new Date(entry.date * 1000)).getMonth() + 1);
		$('#eDateDay').val((new Date(entry.date * 1000)).getDate());
		$('#eNameInput').val(entry.name);
		$('#eCatInput').val(entry.category);
	}

	/**
	 * Displays a dialog to maintain the auto allocation and handles
	 * the interaction of this dialog.
	 * 
	 * @return {bool} True if the input is valid, else false.
	 */
	setAllocationDialog() {
		let title = this.view.textData['autoAllocation'];
		let text = this.view.template.fromTemplate('autoAllocationDialog.html');
		let allocation = this.view.storage.readMainStorage('allocation');
		
		this.displayDialog(title, text, () => {
			this.view.storage.writeMainStorage('allocationOn', $('#autoAllocation').prop('checked'));

			let sum = allocation.reduce((p, c) => p + parseInt($(`[id='val-${c[0]}']`).val()), 0);
			if (sum !== 100) { // Values must sum up to 100
				this.displayErrorMsg(this.view.textData['sumUpTo100']);
				return false;
			}

			allocation.forEach((budget, index) => {
				allocation[index][1] = parseInt($(`[id='val-${budget[0]}']`).val());
			});

			this.view.storage.writeMainStorage('allocation', allocation);

			return true;
		});

		$('#autoAllocation').prop('checked', this.view.storage.readMainStorage('allocationOn'));

		let tableRows = [[this.view.textData['budget'], this.view.textData['percentage']]];
		this.view.storage.readMainStorage('budgets').forEach(budget => {
			tableRows.push([budget[0], this.view.elt('input', {
				class: 'form-control',
				id: `val-${budget[0]}`,
				type: 'number',
				size: 3,
				min: 0,
				max: 100,
				value: allocation.find(b => b[0] === budget[0])[1]
			})]);
		});
		$('#allocationTable').html(this.view.template.table(tableRows));
	}
}