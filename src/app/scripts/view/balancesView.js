const ChartHandler = require(__dirname + '/../utils/chartHandler.js');
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
		this.storage.readMainStorage('budgets').forEach(budget => {
			$('#budgetSelect').append(new Option(budget[0], budget[0]));
		});

		$('#typeSelect #all').text(this.textData['all']);
		$('#nameSearch').prop('placeholder', this.textData['allTransactions']);
		$('#catSearch').prop('placeholder', this.textData['allCategories']);

		// activateDateRangePicker( "#dateSelect" );
			
		// $( "#nameSelect" ).autocomplete({
		// source: readMainStorage( "availableNames" )
		// });

		// $( "#categorySelect" ).autocomplete({
		// source: readMainStorage( "availableCategories" )
		// });
	}

	/**
	 * Displays the overview, following the selected filters from the controls.
	 */
	displayOverview(id) {
		let budget = $('#budgetSelect option:selected');
		let type = $('#typeSelect option:selected');
		let amountFrom = $('#amountFrom').val();
		let amountTo = $('#amountTo').val();
		let name = $('#nameSearch').val();
		let cats = $('#catSearch').val();

		//if (inputHandler.isValidAmount( amountFrom, true ))

		$(id).html('');

		return;

		/**
		 * This function displays the details the user wishes to see.
		 * @param {String} displayType This indicates how the data will be displayed (table/graph).
		 * The following are filters for the data.
		 * @param {String} budget Indicates which budget should be displayed.
		 * @param {String} type Indictates which type of transactions should be displayed.
		 * @param {Object} startDate Indictates the start of the date range for transactions to be displayed.
		 * @param {Object} endDate Indictates the end of the date range for transactions to be displayed.
		 * @param {String} amountFrom Indictates a minimum amount for transactions to be displayed.
		 * @param {String} amountTo Indictates a maximum amount for transactions to be displayed.
		 * @param {String} name Indictates which transactions should be displayed (by name).
		 * @param {String} category Indictates which category should be displayed.
		 */
		function displayContent( displayType, budget, type, startDate, endDate, amountFrom, amountTo,
			name, category ) {
			// Before doing anything, we check if the input is valid.
			// Input invalid?
			if ( !(inputHandler.isValidAmount( amountFrom, true ) && inputHandler.isValidAmount( amountTo, true )) ) {

			}
			// Get all data before displaying anthing.
			// Find out which data the user wants to see, then apply filter and display the chart.
			var paramList = [];
			if ( budget.length > 0 ) paramList.push( ["budget", budget] );
			if ( type.length > 0 ) paramList.push( ["type", type] );
			if ( name.length > 0 ) paramList.push( ["name", name] );
			if ( category.length > 0 ) paramList.push( ["category", category] );
			// Now, create a quest. If no parameter were selected, we get all data unfiltered.
			var quest;
			// At least one filter?
			if ( paramList.length > 0 ) {
			quest = { connector : "and", params : paramList };
			}
			// No filter?
			else {
			// No filters applied? Select all data.
			quest = { connector : "or", params : [["type", "earning"], ["type", "spending"]] };
			}
			// Find out in which files we want to search.
			var files = [];
			// Date selected?
			if ( startDate !== null && endDate !== null ) {
			// Get start and end date as a file name (reversed file name).
			var startDateFileName = startDate.getFullYear() + "." +
							((startDate.getMonth() + 1) < 10 ?
							"0" + (startDate.getMonth() + 1) :
							(startDate.getMonth() + 1));
			var endDateFileName = endDate.getFullYear() + "." +
							((endDate.getMonth() + 1) < 10 ?
							"0" + (endDate.getMonth() + 1) :
							(endDate.getMonth() + 1));
			// For comparing, we need to reverse file names.
			var allFiles = getJsonFiles();
			for ( var i = 0; i < allFiles.length; i++ ) {
			// Reverse file name.
			var tmp = allFiles[i].split( "." )[1] + "." + allFiles[i].split( "." )[0];
			// Check if the file is in the given range
			// (Note: This will only filter months and years).
			if ( startDateFileName <= tmp && endDateFileName >= tmp ) {
			files.push( allFiles[i] );
			}
			}
			}
			// No date filter? Apply the standard range (current month).
			else {
			// Returns the current file (without .json ending).
			files.push( getCurrentFilename().substring( 0, getCurrentFilename().lastIndexOf( "." ) ) );
			}
			// Get all the matching data from every available file.
			var data = [];
			for ( var i = 0; i < files.length; i++ ) {
			// Append new data to the data we already found.
			data = getData( files[i] + ".json", quest ).concat( data );
			}
			// Filter the data again.
			var newData = [];
			var totalSum = 0;
			for ( var i = 0; i < data.length; i++ ) {
			// Amount not within the specified range? Continue without pushing the data.
			// Minimum amount exists?
			if ( amountFrom.length > 0 && parseFloat( amountFrom ) > data[i].amount ) {
			continue;
			}
			// Maximum amount exists?
			if ( amountTo.length > 0 && parseFloat( amountTo ) < data[i].amount ) {
			continue;
			}
			// Date not within the specified range? Continue without pushing the data.
			// Start date exists?
			if ( startDate !== null && startDate.getMonth() === new Date( data[i].date * 1000 ).getMonth()
							&& startDate.getFullYear() === new Date( data[i].date * 1000 ).getFullYear() ) {
			if ( startDate.getDate() > new Date( data[i].date * 1000 ).getDate() ) {
			continue;
			}
			}
			// End date exists?
			if ( endDate !== null && endDate.getMonth() === new Date( data[i].date * 1000 ).getMonth() 
							&& endDate.getFullYear() === new Date( data[i].date * 1000 ).getFullYear()) {
			if ( endDate.getDate() < new Date( data[i].date * 1000 ).getDate() ) {
			continue;
			}
			}
			// If we passed the filters above, we can push the data.
			newData.push( data[i] );
			totalSum += data[i].amount;
			}
			// Save the filtered data.
			data = newData;
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