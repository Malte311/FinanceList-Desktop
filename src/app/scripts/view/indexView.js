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

			$(id).append(
				'<h5><i class=\'fas fa-angle-double-right w3-text-deep-purple\'></i>' + ' ' +
				budgetName +
				' </h5>'
			);

			let percentage = 100;
			let color = 'secondary';
			// Positive balance for this month:
			if ( earnings - spendings > 0 ) {
				// Calculate the ratio of how much money is left from this months
				// earnings and use the color green.
				if ( earnings > 0 ) {
					percentage = ((earnings - spendings) / earnings) * 100;
				}
				color = 'success';
			}
			// Balance negative: Red color, percentage still at 100 (so the complete bar is red).
			else if ( earnings - spendings < 0 ) {
				color = 'danger';
			}

			// We want to display $2.50 instead of $2.50000000002 (this may happen since we use floating point numbers),
			// so we round the balance.
			let balance = Math.round( (earnings - spendings) * 1e2 ) / 1e2;
			totalSum += balance;
			balance = balance.toFixed(2);

			// Now we are ready to display a progress bar which contains the difference.
			console.log(this.template.progress(percentage, balance + this.getCurrencySign()))
			$(id).append(this.template.progress(percentage, balance + this.getCurrencySign()));
		}

		totalSum = totalSum.toFixed(2);
		$(id).append(
			'<br>' +
			'<center>' +
				this.textData['totalSum'] + ': ' +
				totalSum + this.getCurrencySign() +
			'</center>'
		);
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
