const ChartHandler = require(__dirname + '/../utils/chartHandler.js');
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
		this.displayAllTimeChart('#allTimeSpendings', 'spending');
		this.displayRecentTransactions('#recentEarnings', 'earning');
		this.displayAllTimeChart('#allTimeEarnings', 'earning');
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

	/**
	 * Displays a chart which visualizes all time transactions.
	 * 
	 * @param {string} id The id of the dom element in which the chart should appear.
	 * @param {string} type The type of transactions we want to visualize (earning or spending).
	 */
	displayAllTimeChart(id, type) {
		// Reset the canvas in case no data existed before (then the HTML content was overwritten).
		$( id ).html(
			"<canvas id=\"" + type + "\" width=\"8000\" height=\"2500\"></canvas>" );
		// Get a reference to the canvas in which the chart should be.
		var transactionChart = $( "#" + type )[0];
		// Get all budgets.
		var allTimeTransactions = (type === "earning" ?
			this.storage.readMainStorage( "allTimeEarnings" ) :
			this.storage.readMainStorage( "allTimeSpendings" ));
		// Declare some variables to store the values in them.
		var labels = [], dataset = [];
		// We will declare a variable to make sure there is at least one earning/spending.
		// In addition to that, this will contain the sum of all spendings/earnings.
		var checksum = 0;
		// Iterate over them to get the all time spendings.
		for ( var i = 0; i < allTimeTransactions.length; i++ ) {
			// Get the name of every budget.
			labels.push( allTimeTransactions[i][0] );
			// Get the balance of every budget
			dataset.push(allTimeTransactions[i][1].toFixed(2));
			// Add the amount to sum up all transactions.
			checksum = (Math.round( (checksum + allTimeTransactions[i][1]) * 1e2 ) / 1e2);
		}

		let transactions = allTimeTransactions;
		(new ChartHandler(this)).createChart(
			transactionChart,
			transactions.map(t => t[0]),
			transactions.map(t => this.printNum(t[1]))
		);

		if (dataset.length) {
			checksum = checksum.toFixed(2);
			// Create the chart. The colors are declared as a constant in controller.js.
			//(new ChartHandler(this)).createChart( transactionChart, labels, dataset );
			// Display the sum of all time earnings/spendings.
			$( id ).append(
				"<br><center>" +
				(type == "spending" ?
				this.textData['allTimeSpending'] :
				this.textData['allTimeEarning']) + ": " +
				checksum + this.getCurrencySign() + "</center>"
			);
		}
		else {
			$(id).append(`${this.textData['no' + this.capFirstLetter(type)]}`);
		}
	}
}