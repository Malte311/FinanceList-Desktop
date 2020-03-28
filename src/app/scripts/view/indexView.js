const $ = require('jquery');
const View = require(__dirname + '/view.js');

/**
 * Class for displaying the startpage of the application.
 */
module.exports = class IndexView extends View {
	constructor() {
		super();

		this.updateView();
	}

	/**
	 * Updates the view.
	 */
	updateView() {
		let lang = this.storage.readPreference('language');
		this.textData = require(__dirname + `/../../text/text_${lang}.js`);

		this.displayBalances();
	}

	/**
	 * This function displays the current surplus for each budget. This means,
	 * it will display the difference between all earnings from the current month
	 * and all spendings from the current month.
	 */
	displayBalances() {
		console.log("test")
		// Reset previous content.
		$( "#currentBalances" ).html( "" );
		// Get all budgets to iterate over them.
		var currentBudgets = this.storage.readMainStorage( "budgets" );
		var totalSum = 0;
		// Display the monthly surplus for every budget.
		for ( var i = 0; i < currentBudgets.length; i++ ) {
			// Set the name of the budget as a heading.
			$( "#currentBalances" ).append(
				"<h5><i class=\"fas fa-angle-double-right w3-text-deep-purple\"></i>" + " " +
					currentBudgets[i][0] +
				" </h5>"
			);
			// Find out the sum of earnings and spendings in this month,
			// so we can calculate the surplus.
			var quest = { connector:'or', params:[['budget', currentBudgets[i][0]]] };
			var dataObj = this.storage.getData( getCurrentFilename(), quest );
			// Add all earnings and spendings from this month.
			var totalEarningsThisMonth = 0, totalSpendingsThisMonth = 0;
			// Make sure, that data exists. Otherwise we will stay at a surplus of zero.
			if ( dataObj !== undefined ) {
				// Now, add up all the amounts for earnings and spendings each.
				for ( var j = 0; j < dataObj.length; j++ ) {
					// Earning? Increase totalEarningsThisMonth.
					if ( dataObj[j].type === "earning" ) {
						totalEarningsThisMonth =
							Math.round( (totalEarningsThisMonth + dataObj[j].amount) * 1e2 ) / 1e2;
					}
					// Spending? Increase totalSpendingsThisMonth.
					else if ( dataObj[j].type === "spending" ) {
						totalSpendingsThisMonth =
							Math.round( (totalSpendingsThisMonth + dataObj[j].amount) * 1e2 ) / 1e2;
					}
				}
			}
			// Now, find out if the difference between earnings and spendings is
			// either positive, negative or neutral (zero).
			var percentage = 100;
			var color;
			// Positive balance for this month:
			if ( totalEarningsThisMonth - totalSpendingsThisMonth > 0 ) {
				// Calculate the ratio of how much money is left from this months
				// earnings and use the color green.
				if ( totalEarningsThisMonth > 0 && totalSpendingsThisMonth !== 0 ) {
					percentage = ((totalEarningsThisMonth - totalSpendingsThisMonth) / totalEarningsThisMonth) * 100;
				}
				color = "green";
			}
			// Balance negative: Red color, percentage still at 100 (so the complete bar is red).
			else if ( totalEarningsThisMonth - totalSpendingsThisMonth < 0 ) {
				color = "red";
			}
			// Balance is exactly zero for this month: Gray color and percentage still at 100:
			else {
				color = "gray";
			}
			// We want to display $2.50 instead of $2.50000000002 (this may happen since we use floating point numbers),
			// so we round the balance.
			var balance = Math.round( (totalEarningsThisMonth - totalSpendingsThisMonth) * 1e2 ) / 1e2;
			totalSum += balance;
			balance = beautifyAmount( balance );

			// Now we are ready to display a progress bar which contains the difference.
			$( "#currentBalances" ).append(
				"<p></p><div class=\"w3-grey\"><div class=\"w3-container w3-center w3-padding w3-" +
				color + "\" style=\"width:" + percentage + "%;\">" + balance + getCurrencySign() +
				"</div></div>"
			);

			// After doing this for all budgets, we display the total sum for the current month.
			if ( i == currentBudgets.length - 1 ) {
				totalSum = beautifyAmount( Math.round( totalSum * 1e2 ) / 1e2 );
				$( "#currentBalances" ).append(
					"<br>" +
					"<center>" +
						textElements.totalSum + ": " +
						totalSum + getCurrencySign() +
					"</center>"
				);
			}
		}
	}
}

// function updateView() {
//     // Display current balances.
//     displayBalances();
//     // Display a table of recent spendings.
//     displayRecentTransactions( "spending" );
//     // Display all time spendings.
//     displayChart( "spending" );
//     // Display a table of recent earnings.
//     displayRecentTransactions( "earning" );
//     // Display all time earnings.
//     displayChart( "earning" );
// }
