const View = require(__dirname + '/view.js');
const {timestampToString} = require(__dirname + '/../utils/dateHandler.js');

/**
 * Class for controlling the startpage of the application.
 */
class IndexView extends View {
	/**
	 * @param {Storage} storage Storage object.
	 */
	constructor(storage) {
		super(storage);
	}

	/**
	 * Updates the view.
	 */
	updateView() {
		this.displayBudgets('#currentBudgets');
		this.displayRecurrTrans('#recurrTrans');
		this.displayBalances('#currentBalances');
		this.displayRecentTransactions('#recentSpendings', 'spending');
		this.displayRecentTransactions('#recentEarnings', 'earning');
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
			this.textData['edit']
		];

		if (this.storage.readMainStorage('allocationOn')) {
			headings.push(this.textData['allocationRatio']);
		}
		
		let budgets = this.storage.readMainStorage('budgets');
		
		let rows = budgets.map(b => [
			b[0], // Index 0: name of the budget.
			this.printNum(b[1]), // Index 1: balance of the budget.
			this.elt('div', {}, this.elt('button', {
				id: 'btnEditBudget',
				class: 'btn btn-outline-primary',
				onclick: `$('#modalHidden').val('${b[0]}')`,
				['data-toggle']: 'modal',
				['data-target']: '#divModal'
			}, this.template.icon('edit', 'black')))]);

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
			this.textData['interval'], this.textData['endDate'], this.textData['edit']
		]];

		this.storage.readMainStorage('recurring').sort((a, b) => a.name < b.name ? -1 : 1).forEach(t => {
			let allocOn = t.allocationOn;
			tableRows.push([
				t.name, this.printNum(t.amount), t.type, allocOn ? '\u2013' : t.budget,
				t.category, timestampToString(t.nextDate), this.textData['intervalNames'][t.interval],
				t.endDate > 0 ? timestampToString(t.endDate) : '\u2013',
				this.elt('button', {
					id: 'btnEditRecTrans',
					class: 'btn btn-outline-primary',
					onclick: `$('#modalHidden').val('${t.startDate}')`,
					['data-toggle']: 'modal',
					['data-target']: '#divModal',
				}, this.template.icon('edit', 'black')),
			]);
		});

		if (tableRows.length > 1) {
			$(id).html(this.template.table(tableRows));
		} else {
			$(id).html(this.textData['noRecurrTrans']);
		}
	}

	/**
	 * Displays the current (= current month) surplus for each budget.
	 * 
	 * @param {string} id The id of the dom element in which the content should appear.
	 */
	displayBalances(id) {
		$(id).html('');

		let totalSum = 0;
		for (let budget of this.storage.readMainStorage('budgets')) {
			let budgetName = budget[0];

			let earnings = this.dataHandle.getMonthlySum(budgetName, 'earning');
			let spendings = this.dataHandle.getMonthlySum(budgetName, 'spending');

			$(id).append(this.elt('h4', {class: 'mt-3 mb-2'}, this.template.icon(
				'creditcard', 'blue'
			), ` ${budgetName}`));

			let balance = earnings - spendings;
			let percentage = balance > 0 ? ((earnings - spendings) / earnings) * 100 : 100;
			let color = balance > 0 ? 'green' : (balance < 0 ? 'red' : 'gray');

			$(id).append(this.template.progress(percentage, color, this.printNum(balance)));
			
			totalSum += parseFloat(balance);
		}

		let totalSumLabel = `${this.textData['totalSum']}: ${this.printNum(totalSum)}`;
		$(id).append(this.elt('center', {class: 'mt-3 mb-2'}, totalSumLabel));
	}

	/**
	 * Displays recent transactions, if existing.
	 * 
	 * @param {string} id The id of the dom element in which the content should appear.
	 * @param {string} type The type of transactions we want to display
	 * (can be either earning or spending).
	 */
	displayRecentTransactions(id, type) {
		let limit = 10; // Maximum number of entries to be displayed.

		$(id).html('');

		let data = this.dataHandle.getRecentTrans(limit, type);
		if (data.length) {			
			$(id).append(this.template.table(data.map(d => [
				this.elt('div', {}, d.type === 'earning' ?
					this.template.icon('cashregister', 'green') : this.template.icon('shoppingbag', 'red'),
				` ${d.name}`),
				this.printNum(d.amount),
				timestampToString(d.date)
			]))); // Displays the table.
		}
		else {
			// Display a message that no earnings/spendings exist.
			$(id).append(`${this.textData['no' + this.capFirstLetter(type)]}`);
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

module.exports = IndexView;