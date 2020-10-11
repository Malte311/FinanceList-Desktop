const InputHandler = require(__dirname + '/inputHandler.js');
const {dateToTimestamp, timestampToFilename} = require(__dirname + '/dateHandler.js');

/**
 * Class for handling all kinds of dialogs.
 */
class DialogHandler {
	/**
	 * @param {View} view View object.
	 */
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
					dialogHandler.addTransactionDialog();
					break;
				case 'btnAddUser':
					dialogHandler.addUserProfileDialog();
					break;
				case 'btnEditBudget':
					dialogHandler.editBudgetDialog($('#modalHidden').val());
					break;
				case 'btnEditEntry':
					dialogHandler.editEntryDialog($('#modalHidden').val());
					break;
				case 'btnEditRecTrans':
					dialogHandler.editRecTransDialog($('#modalHidden').val());
					break;
				case 'btnEditUserProfile':
					dialogHandler.editUserProfileDialog($('#modalHidden').val());
					break;
				case 'btnTransfer':
					dialogHandler.execTransferDialog();
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

		modal.modal('show');
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

			const Budget = require(__dirname + '/../handle/budget.js');
			(new Budget(this.view.storage)).addBudget(newBudget);

			return true;
		});
	}

	/**
	 * Displays a dialog to add a new transaction and handles the interaction of this dialog.
	 * 
	 * @return {bool} True if the input is valid, else false.
	 */
	addTransactionDialog() {
		let title = this.view.textData['addTransaction'];
		let text = this.view.template.fromTemplate('addTransactDialog.html');
		
		this.displayDialog(title, text, () => {
			let d = $('#dateDay').val(), m = $('#dateMonth').val(), y = $('#dateYear').val();
			let eD = $('#endDateDay').val(), eM = $('#endDateMonth').val(), eY = $('#endDateYear').val();
			let noEndChecked = $(`#${this.view.lang}NoEndDate`).prop('checked');
			let alloc = $('input[name="allocation"]:checked').val();

			if (!this.inputHandler.isValidAmount($('#sumInput').val().trim())) {
				this.displayErrorMsg(this.view.textData['invalidAmount']);
				return false;
			} else if (!this.inputHandler.isValidDate(d, m ,y)) {
				this.displayErrorMsg(this.view.textData['invalidDateInput']);
				return false;
			} else if (!this.inputHandler.isValidEntryName($('#nameInput').val().trim())) {
				let msg = this.view.textData['invalidEntryName']
					.replace(/%%MAXLEN%%/g, this.inputHandler.maxStrLen)
					.replace(/%%MAXWLEN%%/g, this.inputHandler.maxSwLen);
				this.displayErrorMsg(msg);
				return false;
			} else if (!noEndChecked && !this.inputHandler.isValidDate(eD, eM, eY)) {
				this.displayErrorMsg(this.view.textData['invalidDateInput']);
				return false;
			}

			let autoAlloc = this.view.storage.readMainStorage('allocationOn');
			let obj = {
				date: dateToTimestamp(d, m ,y),
				name: $('#nameInput').val().trim(),
				amount: $('#sumInput').val().trim(),
				budget: $('#budgetSelect option:selected').text(),
				type: $('input[name="type"]:checked').val(),
				category: $('#categoryInput').val().trim()
			};

			if ($(`#${this.view.lang}Automate`).prop('checked')) { // Recurring transaction
				let endDate = noEndChecked ? -1 : dateToTimestamp(eD, eM, eY);
				let recObj = Object.assign({
					startDate: obj.date,
					endDate: endDate,
					interval: $('#intervalSelect').val(),
					allocationOn: autoAlloc && obj.type === 'earning' && alloc === 'auto'
				}, obj);
				delete recObj.date;
				
				const RecurrTrans = require(__dirname + '/../updates/recurrTrans.js');
				(new RecurrTrans(this.view.storage)).addRecurringTransaction(recObj);
			} else {
				const Transact = require(__dirname + '/../handle/transact.js');
				if (obj.type === 'earning') {
					(new Transact(this.view.storage)).addEarning(obj, autoAlloc && alloc === 'auto');
				} else {
					(new Transact(this.view.storage)).addSpending(obj);
				}
			}

			this.view.addToAutocomplete('availableNames', $('#nameInput').val().trim());
			this.view.addToAutocomplete('availableCategories', $('#categoryInput').val().trim());

			return true;
		});

		$(`#${this.view.lang}Spending`).prop('checked', true); // Select spending by default
		
		['dateYear', 'endDateYear'].forEach(id => $(`#${id}`).val((new Date()).getFullYear()));
		['dateMonth', 'endDateMonth'].forEach(id => $(`#${id}`).val((new Date()).getMonth() + 1));
		['dateDay', 'endDateDay'].forEach(id => $(`#${id}`).val((new Date()).getDate()));

		this.view.storage.readMainStorage('budgets').forEach(budget => {
			$('#budgetSelect').append(new Option(budget[0], budget[0]));
		});

		if (this.view.storage.readMainStorage('allocationOn')) {
			$(`#${this.view.lang}AutoAl`).prop('checked', true); // Select auto allocation by default
		} else {
			$(`#allocForm`).hide();
			$(`#${this.view.lang}ManualAl`).prop('checked', true);
		}

		$(`#intervalSelect option[lang=${this.view.lang}][value=0]`).prop('selected', true);

		$('#nameInput').autocomplete({
			appendTo: '#divModal',
			source: this.view.storage.readMainStorage('availableNames')
		});
		$('#categoryInput').autocomplete({
			appendTo: '#divModal',
			source: this.view.storage.readMainStorage('availableCategories')
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
			const Budget = require(__dirname + '/../handle/budget.js');

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

		$('#renInput').prop('placeholder', name);

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

			const Entry = require(__dirname + '/../handle/entry.js');
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


	/**
	 * Edits a given recurring transaction.
	 * 
	 * @param {string} id The id (= start date) of the recurring transaction.
	 * @return {bool} True if the input is valid, else false.
	 */
	editRecTransDialog(id) {
		let title = this.view.textData['editRecTrans'];
		let text = this.view.template.fromTemplate('editRecTransDialog.html');
		let rt = this.view.storage.readMainStorage('recurring').find(r => r.startDate === parseInt(id));
		let dArr = ['#rtDateDay', '#rtDateMonth', '#rtDateYear'];
		
		this.displayDialog(title, text, () => {
			let endDate = dArr.some(id => $(id).val().trim() !== '') ? dArr.map(id => $(id).val()) : -1;

			if (!this.inputHandler.isValidEntryName($('#rtNameInput').val())) {
				let msg = this.view.textData['invalidEntryName']
					.replace(/%%MAXLEN%%/g, this.inputHandler.maxStrLen)
					.replace(/%%MAXWLEN%%/g, this.inputHandler.maxSwLen);
				this.displayErrorMsg(msg);
				return false;
			} else if (!this.inputHandler.isValidAmount($('#rtAmountInput').val(), false)) {
				this.displayErrorMsg(this.view.textData['invalidAmount']);
				return false;
			} else if (endDate !== -1 && !this.inputHandler.isValidDate(...endDate)) {
				this.displayErrorMsg(this.view.textData['invalidDateInput']);
				return false;
			}

			let newProps = {
				name: $('#rtNameInput').val(),
				amount: parseFloat($('#rtAmountInput').val()),
				category: $('#rtCatInput').val(),
				interval: $('#rtIntervalSel option:selected').val(),
				endDate: endDate !== -1 ? dateToTimestamp(...endDate) : -1
			};

			const RecTrans = require(__dirname + '/../updates/recurrTrans.js');
			if ($('#delCheck').prop('checked')) {
				(new RecTrans(this.view.storage)).deleteRecurringTransaction(id);
			} else {
				(new RecTrans(this.view.storage)).editRecurringTransaction(id, newProps);
			}

			return true;
		});

		$('#rtNameInput').val(rt.name);
		$('#rtAmountInput').val(rt.amount);
		$('#rtCatInput').val(rt.category);
		$(`#rtIntervalSel option[lang=${this.view.lang}][value=${rt.interval}]`).prop('selected', true);

		if (rt.endDate !== -1) {
			$('#rtDateYear').val((new Date(rt.endDate * 1000)).getFullYear());
			$('#rtDateMonth').val((new Date(rt.endDate * 1000)).getMonth() + 1);
			$('#rtDateDay').val((new Date(rt.endDate * 1000)).getDate());
		}
	}

	/**
	 * Displays a dialog to add a new user profile and handles the interaction of this dialog.
	 * 
	 * @return {bool} True if the input is valid, else false.
	 */
	addUserProfileDialog() {
		let title = this.view.textData['addUserProfile'];
		let text = this.view.template.fromTemplate('addUserProfileDialog.html');

		this.displayDialog(title, text.replace(/%%MAXLEN%%/g, this.inputHandler.maxSwLen), () => {
			if (!this.inputHandler.isValidUserProfile($('#unameInput').val())) {
				let msg = this.view.textData['invalidUserProfileName'];
				this.displayErrorMsg(msg.replace(/%%MAXLEN%%/g, this.inputHandler.maxSwLen));
				return false;
			}

			const UserProfile = require(__dirname + '/../user/userProfile.js');
			(new UserProfile(this.view.storage)).addUserProfile($('#unameInput').val());

			return true;
		});
	}

	/**
	 * Displays a dialog to edit the user profiles and handles the interaction of this dialog.
	 * 
	 * @param {string} user The user profile to edit.
	 * @return {bool} True if the input is valid, else false.
	 */
	editUserProfileDialog(user) {
		let title = this.view.textData['editUserProfile'];
		let text = this.view.template.fromTemplate('editUserProfileDialog.html');
		text = text.replace(/%%MAXLEN%%/g, this.inputHandler.maxSwLen).replace(/%%USER%%/g, user);

		this.displayDialog(title, text, () => {
			const UserProfile = require(__dirname + '/../user/userProfile.js');

			if ($('#uDelCheck').prop('checked') && $('#uDelInput').val() === user) {
				(new UserProfile(this.view.storage)).deleteUserProfile(user);
			} else if ($('#uDelCheck').prop('checked')) {
				this.displayErrorMsg(this.view.textData['invalidCheckInput']);
				return false;
			} else if (this.inputHandler.isValidUserProfile($('#uRenInput').val().trim())) {
				(new UserProfile(this.view.storage)).renameUserProfile(user, $('#uRenInput').val().trim());
			} else {
				let msgTxt = this.view.textData['invalidUserProfileName'];
				this.displayErrorMsg(msgTxt.replace(/%%MAXLEN%%/g, this.inputHandler.maxSwLen));
				return false;
			}

			return true;
		});

		$('#uRenInput').prop('placeholder', user);

		if (this.view.storage.readPreference('users').findIndex(u => u === user) !== 0) {
			$('#uDelDiv').show(); // Allow deleting only if the user profile is not the default one
		}
	}

	/**
	 * Displays a dialog to transfer sums and handles the interaction of this dialog.
	 * 
	 * @return {bool} True if the input is valid, else false.
	 */
	execTransferDialog() {
		let title = this.view.textData['transfer'];
		let text = this.view.template.fromTemplate('transferDialog.html');
		
		this.displayDialog(title, text, () => {
			let amount = $('#transferAmount').val();

			if (!this.inputHandler.isValidAmount(amount, false)) {
				this.displayErrorMsg(this.view.textData['invalidAmount']);
				return false;
			}

			let from = $('#fromSelect option:selected').text();
			let to = $('#toSelect option:selected').text();
			if (from !== to) {
				const Transact = require(__dirname + '/../handle/transact.js');
				(new Transact(this.view.storage)).addTransferEntries(from, to, parseFloat(amount));
			}

			return true;
		});

		this.view.storage.readMainStorage('budgets').forEach(budget => {
			$('#fromSelect').append(new Option(budget[0], budget[0]));
			$('#toSelect').append(new Option(budget[0], budget[0]));
		});
	}
}

module.exports = DialogHandler;