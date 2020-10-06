const BudgetDialogHandler = require(__dirname + '/../utils/dialog/budgetDialogHandler.js');

const {timestampToString} = require(__dirname + '/../utils/dateHandler.js');

const View = require(__dirname + '/view.js');

/**
 * Class for controling the balances page of the application.
 */
module.exports = class BalancesView extends View {
	constructor(storage) {
		super(storage);
	}

	/**
	 * Updates the view.
	 */
	updateView() {
		this.displayBudgets('#currentBudgets');
		this.displayRecurrTrans('#recurrTrans');
	}

	/**
	 * Displays all currently available budgets in a simple overview.
	 * 
	 * @param {string} id The id of the dom element which contains the budget display.
	 */
	displayBudgets(id) {
		let headings = [
			this.textData['budget'],
			this.textData['balance'],
			this.textData['renamedelete']
		];

		if (this.storage.readMainStorage('allocationOn')) {
			headings.push(this.textData['allocationRatio']);
		}
		
		let budgets = this.storage.readMainStorage('budgets');
		
		let rows = budgets.map((b, index) => [
			b[0], // Index 0: name of the budget.
			this.printNum(b[1]), // Index 1: balance of the budget.
			this.elt('span', {
				onclick: () => (new BudgetDialogHandler(this)).renameBudget(b[0])
			}, this.template.icon('edit', 'blue'), index === 0 ? '' : this.elt('span', {
				onclick: () => (new BudgetDialogHandler(this)).deleteBudget(b[0])
			}, this.template.icon('delete', 'red')))]);

		if (this.storage.readMainStorage('allocationOn')) {
			let allocation = this.storage.readMainStorage('allocation');
			rows.forEach((row, index) => row.push(allocation[index][1] + '\u0025')); // \u0025 = %
		}

		rows.unshift(headings);

		$(id).html(this.template.table(rows));

		let overallBalance = budgets.map(b => b[1]).reduce((prev, curr) => prev + curr, 0);
		let overallLabel = `${this.textData['overallBalance']}: ${this.printNum(overallBalance)}`;
		$(id).append(this.elt('center', {}, overallLabel));
	}

	/**
	 * Displays all recurring transactions in a simple overview.
	 * 
	 * @param {string} id The id of the dom element which contains the
	 * recurring transactions display.
	 */
	displayRecurrTrans(id) {
		let tableRows = [[
			this.textData['name'], this.textData['amount'], this.textData['type'],
			this.textData['budget'], this.textData['category'], this.textData['nextExecution'],
			this.textData['interval'], this.textData['endDate'], this.textData['edit'],
			this.textData['delete']
		]];

    	// "recurringTransactionsContent": ["earning", "spending", "days", "No recurring transactions available."],

		this.storage.readMainStorage('recurring').forEach(t => {
			let allocOn = t.allocationOn;
			tableRows.push([
				t.name, this.printNum(t.amount), t.type, allocOn ? '\u2013' : t.budget,
				t.category, timestampToString(t.nextDate), this.textData['intervalNames'][t.interval],
				t.endDate > 0 ? timestampToString(t.endDate) : '\u2013',
				this.elt('span', {}, this.template.icon('edit', 'blue')),
				this.elt('span', {}, this.template.icon('delete', 'red'))
			]);
		});

		if (tableRows.length > 1) {
			$(id).html(this.template.table(tableRows));
		} else {
			$(id).html(this.textData['noRecurrTrans']);
		}
	}

	/**
	 * Adds a new value to the array of possible autocomplete options, if it is not included yet.
	 * 
	 * @param {string} field The field to which a new value should be added.
	 * @param {string} newValue The new value to add.
	 */
	addToAutocomplete(field, newValue) {
		let arr = this.storage.readMainStorage(field);
		if (!arr.includes(newValue) && newValue !== '') {
			arr.push(newValue);
		}
		this.storage.writeMainStorage(field, arr);
	}
}