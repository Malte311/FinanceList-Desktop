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

			$(id).append(this.elt('h4', {}, this.template.icon(
				'creditcard', 'blue'
			), ` ${budgetName}`)); // Space in front of ${budgetName} is intended.

			let balance = earnings - spendings;
			let percentage = earnings > 0 ? ((earnings - spendings) / earnings) * 100 : 100;
			let color = balance > 0 ? 'green' : (balance < 0 ? 'red' : 'gray');

			$(id).append(this.template.progress(percentage, color, this.printNum(balance)));
			
			totalSum += parseFloat(balance);
		}

		let totalSumLabel = `${this.textData['totalSum']}: ${this.printNum(totalSum)}`;
		$(id).append(this.elt('center', {}, totalSumLabel));
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
