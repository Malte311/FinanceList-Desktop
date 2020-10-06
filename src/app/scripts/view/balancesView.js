const {timestampToFilename, dateToTimestamp} = require("../utils/dateHandler");

const ChartHandler = require(__dirname + '/../utils/chartHandler.js');
const InputHandler = require(__dirname + '/../utils/inputHandler.js');
const View = require(__dirname + '/view.js');

/**
 * Class for controlling the balances page of the application.
 */
module.exports = class BalancesView extends View {
	constructor(storage) {
		super(storage);
	}

	/**
	 * Updates the view.
	 */
	updateView() {
		this.displayOverviewControls();
		this.displayOverview('#mainContent');
		this.displayAllTimeChart('#allTimeSpendings', 'spending');
		this.displayAllTimeChart('#allTimeEarnings', 'earning');
	}

	/**
	 * Displays the overview content controls (controls for filtering data).
	 */
	displayOverviewControls() {
		$('#budgetSelect').html(new Option(this.textData['allBudgets'], 'all'));
		this.storage.readMainStorage('budgets').forEach(budget => {
			$('#budgetSelect').append(new Option(budget[0], budget[0]));
		});

		$('#typeSelect #all').text(this.textData['allTypes']);
		$('#nameSearch').prop('placeholder', this.textData['allTransactions']);
		$('#catSearch').prop('placeholder', this.textData['allCategories']);
			
		$('#nameSearch').autocomplete({source: this.storage.readMainStorage('availableNames')});
		$('#catSearch').autocomplete({source: this.storage.readMainStorage('availableCategories')});
	}

	/**
	 * Displays the overview, following the selected filters from the controls.
	 */
	displayOverview(id) {
		let budget = $('#budgetSelect option:selected').val();
		let type = $('#typeSelect option:selected').val();
		let amountFrom = $('#amountFrom').val();
		let amountTo = $('#amountTo').val();
		let name = $('#nameSearch').val();
		let cat = $('#catSearch').val();

		let input = new InputHandler(this.storage);
		if (!input.isValidAmount(amountFrom, true) || !input.isValidAmount(amountTo, true)) {
			return;
		}

		let paramList = [];
		if (budget.trim().length > 0 && budget !== 'all') paramList.push(['budget', budget]);
		if (type.trim().length > 0 && type !== 'all')     paramList.push(['type', type]);
		if (name.trim().length > 0)                       paramList.push(['name', name]);
		if (cat.trim().length > 0)                        paramList.push(['category', cat]);

		let quest = paramList.length > 0 ? {
			connector: 'and',
			params: paramList
		} : {
			connector: 'or',
			params: [['type', 'earning'], ['type', 'spending']]
		};

		// TODO: Check if dates are valid, handle empty inputs (they are valid!)

		let start = timestampToFilename(dateToTimestamp(
			$('#dateFromDay').val(),
			$('#dateFromMonth').val(),
			$('#dateFromYear').val())
		);
		let end = timestampToFilename(dateToTimestamp(
			$('#dateToDay').val(),
			$('#dateToMonth').val(),
			$('#dateToYear').val())
		);

		let data = [];
		this.storage.getJsonFiles().forEach(file => {
			if (start.split('.').reverse() <= file.split('.').reverse()
					&& end.split('.').reverse() >= file.split('.').reverse()) {
				data = this.storage.getData(file, quest).filter(e => {
					return (!amountFrom || amountFrom <= e.amount) && (!amountTo || e.amount <= amountTo);
				}).concat(data);
			}
		});

		let total = data.reduce((prev, curr) => prev + parseFloat(curr.amount), 0);

		$(id).html(this.elt('center', {}, total.toString()));

		return;
			// Data exists?
			if ( data.length > 0 ) {
			// Display the real content. Display a graph?
			if ( displayType === "graph" ) {
			displayGraph( data );
			}
			// Display a table?
			else if ( displayType === "table" ) {
			displayTable( data );
			}
			totalSum = totalSum.toFixed(2);
			$( '#mainContent' ).append(
			"<br>" +
			"<center>" +
			textElements.totalSum + ": " + totalSum + getCurrencySign() +
			"</center>"
			);
			}
			// No data found?
			else {
			// Display a message that no data was found.
			$( "#mainContent" ).html( "<center><i>" + textElements.noTransactions + "</i></center>" );
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
		let amounts = data.map(t => t[1]); // Index 0: label, index 1: amount.
		
		if (amounts.some(amount => parseFloat(amount) > 0.00)) {
			(new ChartHandler(this)).createChart(`#${type}`, data.map(t => t[0]), amounts);

			let totalSum = this.printNum(amounts.reduce((prev, curr) => prev + parseFloat(curr), 0));
			$(id).append(this.elt('center', {},
				`${this.textData['allTime' + this.capFirstLetter(type)]}: ${totalSum}`)
			);
		}
		else {
			$(id).html(`${this.textData['no' + this.capFirstLetter(type)]}`);
		}
	}
}