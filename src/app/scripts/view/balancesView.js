const BudgetDialogHandler = require(__dirname + '/../utils/dialog/budgetDialogHandler.js');

const {timestampToString} = require(__dirname + '/../utils/dateHandler.js');

const ChartHandler = require(__dirname + '/../utils/chartHandler.js');
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
		this.displayAllTimeChart('#allTimeSpendings', 'spending');
		this.displayAllTimeChart('#allTimeEarnings', 'earning');
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

			let totalSum = this.printNum(amounts.reduce((prev, curr) => prev + parseFloat(curr), 0));
			$(id).append(this.elt('center', {},
				`${this.textData['allTime' + this.capFirstLetter(type)]}: ${totalSum}`)
			);
		}
		else {
			$(id).append(`${this.textData['no' + this.capFirstLetter(type)]}`);
		}
	}
}