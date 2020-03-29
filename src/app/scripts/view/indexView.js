const View = require(__dirname + '/view.js');

/**
 * Class for displaying the startpage of the application.
 */
module.exports = class IndexView extends View {
	constructor(storage) {
		super(storage);

		this.updateView();
	}

	/**
	 * Updates the view.
	 */
	updateView() {
		this.displayBalances('#currentBalances');
		this.displayRecentTransactions('#recentSpendings', 'spending');
		this.displayRecentTransactions('#recentEarnings', 'earning');
	}

	/**
	 * Displays the current (= current month) surplus for each budget.
	 * 
	 * @param {string} id The id of the dom element in which the content should appear.
	 */
	displayBalances(id) {
		$(id).html(this.elt('h3', {}, this.template.icon(
			'arrowright', 'green'
		), ` ${this.textData['monthlySurplus']}`));

		let totalSum = 0;
		for (let budget of this.storage.readMainStorage('budgets')) {
			let budgetName = budget[0];

			let earnings = this.dataHandle.getMonthlySum(budgetName, 'earning');
			let spendings = this.dataHandle.getMonthlySum(budgetName, 'spending');

			$(id).append(this.elt('h4', {}, this.template.icon(
				'creditcard', 'blue'
			), ` ${budgetName}`));

			let balance = earnings - spendings;
			let percentage = earnings > 0 ? ((earnings - spendings) / earnings) * 100 : 100;
			let color = balance > 0 ? 'green' : (balance < 0 ? 'red' : 'gray');

			$(id).append(this.template.progress(percentage, color, this.printNum(balance)));
			
			totalSum += parseFloat(balance);
		}

		let totalSumLabel = `${this.textData['totalSum']}: ${this.printNum(totalSum)}`;
		$(id).append(this.elt('center', {}, totalSumLabel));
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

		$(id).html(this.elt('h3', {}, this.template.icon(
			'arrowright', 'green'
		), ` ${this.textData['recent' + this.capFirstLetter(type)]}`));

		let data = this.dataHandle.getRecentTrans(limit, type);
		if (data.length) {
			let {timestampToString} = require(__dirname + '/../utils/dateHandler.js');
			
			$(id).append(this.template.table(data.reverse().map(d => [
				this.template.toHtmlStr(this.template.icon('moneybill', 'green')) + d.name,
				this.printNum(d.amount),
				timestampToString(d.date)
			]).slice(0, limit))); // Displays the table.
		}
		else {
			// Display a message that no earnings/spendings exist.
			$(id).append(`${this.textData['no' + this.capFirstLetter(type)]}`);
		}
	}
}

// function updateView() {
//     // Display current balances.
//     displayBalances();
//     // Display a table of recent spendings.
//     displayRecentTransactions( 'spending' );
//     // Display all time spendings.
//     displayChart( 'spending' );
//     // Display a table of recent earnings.
//     displayRecentTransactions( 'earning' );
//     // Display all time earnings.
//     displayChart( 'earning' );
// }
