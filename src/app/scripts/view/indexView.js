const ChartHandler = require(__dirname + '/../utils/chartHandler.js');
const View = require(__dirname + '/view.js');

/**
 * Class for controlling the startpage of the application.
 */
module.exports = class IndexView extends View {
	constructor(storage) {
		super(storage);
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
		$(id).html('');

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

		$(id).html('');

		let data = this.dataHandle.getRecentTrans(limit, type);
		if (data.length) {
			let {timestampToString} = require(__dirname + '/../utils/dateHandler.js');
			
			$(id).append(this.template.table(data.map(d => [
				this.template.toHtmlStr(this.template.icon('moneybill', 'green')) + d.name,
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
	 * Displays a chart which visualizes all time transactions.
	 * 
	 * @param {string} id The id of the dom element in which the chart should appear.
	 * @param {string} type The type of transactions we want to visualize (earning or spending).
	 */
	displayAllTimeChart(id, type) {
		$(id).html(this.elt('canvas', {
			id: type
		}));
		
		let data = this.storage.readMainStorage(`allTime${this.capFirstLetter(type)}s`);
		if (data.length) {
			let amounts = data.map(t => t[1]); // Index 0: label, index 1: amount.
			(new ChartHandler(this)).createChart(`#${type}`, data.map(t => t[0]), amounts);

			let totalSum = this.printNum(amounts.reduce((prev, curr) => prev + curr, 0));
			$(id).append(this.elt('center', {},
				`${this.textData['allTime' + this.capFirstLetter(type)]}: ${totalSum}`)
			);
		}
		else {
			$(id).append(`${this.textData['no' + this.capFirstLetter(type)]}`);
		}
	}
}