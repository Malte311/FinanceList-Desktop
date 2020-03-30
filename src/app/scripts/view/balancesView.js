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
		this.displayBudgets('#currentBudgets');
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
			this.textData['renamedelete']
		];

		if (this.storage.readMainStorage('allocationOn')) {
			headings.push(this.textData['allocationRatio']);
		}
		
		let budgets = this.storage.readMainStorage('budgets');
		
		let rows = budgets.map((b, index) => [
			b[0], // Index 0: name of the budget.
			this.printNum(b[1]), // Index 1: balance of the budget.
			this.elt('span', {
				onclick: () => {this.renameBudget(b[0]);}
			}, this.template.icon('edit', 'blue')),
			index == 0 ? '' : this.elt('span', {
				onclick: () => {this.deleteBudget(b[0]);}
			}, this.elt('i', {class: 'fas fa-times text-danger'}))
		]);

		if (this.storage.readMainStorage('allocationOn')) {
			rows.forEach(row => row.push(this.storage.readMainStorage('allocation').map(a => a[1] + '&percnt;')));
		}


		console.log(rows)
		$(id).html(this.template.table(rows));

		// // Iterate over all budgets to display them.
		// for ( let i = 0; i < currentBudgets.length; i++ ) {
		// 	let balance = currentBudgets[i][1].toFixed(2);
		// 	// Display all budgets. The first one is a standard budget and can therefore not
		// 	// be deleted. Note that currentBudgets is an array of arrays
		// 	// (name of the budget and its current balance).
		// 	content += "<tr class=\"w3-hover-light-blue\"><td>" + currentBudgets[i][0] + "</td>" +
		// 			"<td>" + balance /*+ getCurrencySign()*/ + "</td>" +
		// 			"<td>" + "<span onclick=\"renameBudget('" + currentBudgets[i][0] + "');\"" +
		// 			"class=\"w3-button\"><i class=\"fas fa-edit\"></i></span>";
		// 	// Every other budget (not default) can be deleted.
		// 	if ( i !== 0 ) {
		// 		content += "<span onclick=\"deleteBudget('" + currentBudgets[i][0] + "');\"" +
		// 				"class=\"w3-button\"><i class=\"fas fa-times w3-text-red\"></i></span></li>";
		// 	}
		// 	content += "</td>";
		// 	// Allocation enabled? Display the ratios.
		// 	// Note: Allocation has the same order as budgets, so we can use the same index.
		// 	if ( this.storage.readMainStorage( "allocationOn" ) ) {
		// 		content += "<td>" + this.storage.readMainStorage( "allocation" )[i][1] + "&percnt;</td>";
		// 	}
		// 	content += "</tr>";
		// }
		// content += "</table><br>";
		
		// $(id).html( content );

		let overallBalance = budgets.map(b => b[1]).reduce((prev, curr) => prev + curr, 0);
		let overallLabel = `${this.textData['overallBalance']}: ${this.printNum(overallBalance)}`;
		$(id).append(this.elt('center', {}, overallLabel));
	}

	renameBudget(budget) {
		console.log(budget);
	}

	deleteBudget(budget) {
		console.log(budget);
	}
}