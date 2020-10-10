const ChartHandler = require(__dirname + '/../utils/chartHandler.js');
const InputHandler = require(__dirname + '/../utils/inputHandler.js');
const View = require(__dirname + '/view.js');

const {timestampToFilename, dateToTimestamp, timestampToString} = require("../utils/dateHandler");

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

		$('#dateToDay').val((new Date((new Date()).getFullYear(), (new Date()).getMonth() + 1, 0)).getDate());
		['dateFromMonth', 'dateToMonth'].forEach(id => $(`#${id}`).val((new Date()).getMonth() + 1));
		['dateFromYear', 'dateToYear'].forEach(id => $(`#${id}`).val((new Date()).getFullYear()));
			
		$('#nameSearch').autocomplete({source: this.storage.readMainStorage('availableNames')});
		$('#catSearch').autocomplete({source: this.storage.readMainStorage('availableCategories')});

		$(`#chartTypeSelect option[lang=${this.lang}][value=${this.storage.readPreference('chartType')}]`).prop('selected', true);
		$('#chartTypeSelect').on('change', () => {
			this.storage.storePreference('chartType', $('#chartTypeSelect option:selected').val());
			this.displayOverview('#mainContent');
		});
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
		if (!input.isValidAmount(amountFrom, true) || !input.isValidAmount(amountTo, true)
				|| (['dateFromDay', 'dateFromMonth', 'dateFromYear'].some(id => $(`#${id}`).val().trim() !== '') &&
					!input.isValidDate($('#dateFromDay').val(), $('#dateFromMonth').val(), $('#dateFromYear').val()))
				|| (['dateToDay', 'dateToMonth', 'dateToYear'].some(id => $(`#${id}`).val().trim() !== '') &&
					!input.isValidDate($('#dateToDay').val(), $('#dateToMonth').val(), $('#dateToYear').val()))) {
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

		let start = ['dateFromDay', 'dateFromMonth', 'dateFromYear'].every(id =>
			$(`#${id}`).val().trim() === '') ? timestampToFilename((new Date('1970-01-01')).getTime() / 1000) :
			timestampToFilename(dateToTimestamp(
				$('#dateFromDay').val(),
				$('#dateFromMonth').val(),
				$('#dateFromYear').val()
			)
		);
		let end = ['dateToDay', 'dateToMonth', 'dateToYear'].every(id =>
			$(`#${id}`).val().trim() === '') ? timestampToFilename((new Date()).getTime() / 1000) :
			timestampToFilename(dateToTimestamp(
				$('#dateToDay').val(),
				$('#dateToMonth').val(),
				$('#dateToYear').val()
			)
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

		if (data.length > 0) {
			let total = data.reduce((prev, curr) => prev + parseFloat(curr.amount), 0);
			let tableRows = [[
				this.textData['date'], this.textData['name'], this.textData['amount'],
				this.textData['category'], this.textData['budget'], this.textData['type'],
				this.textData['edit']
			]];

			data.forEach(d => tableRows.push([
				timestampToString(d.date), d.name, this.printNum(d.amount), d.category,
				d.budget, this.textData[d.type], this.elt('button', {
					id: 'btnEditEntry',
					class: 'btn btn-outline-primary',
					onclick: `$('#modalHidden').val('${d.date}')`,
					['data-toggle']: 'modal',
					['data-target']: '#divModal',
				}, this.template.icon('edit', 'black'))
			]));

			$(id).html(this.elt('div', {}, this.template.table(tableRows, {
				id: 'overviewTable'
			}), this.elt('center', {}, `${this.textData['totalSum']}: ${this.printNum(total)}`)));

			$('#overviewTable').children().first().children().each((index, elem) => {
				$(elem).addClass('tableHead');
				$(elem).on('click', () => this.sortTableByColumn('overviewTable', index));
			});

			$('#graphDiv').html(this.elt('canvas', {id: 'graphCanvas'}));
			(new ChartHandler(this)).createChart(
				'#graphCanvas',
				data.map(d => d.name),
				data.map(d => parseFloat(d.amount).toFixed(2))
			);
		} else {
			$(id).html(this.elt('center', {}, this.textData['noTransactions']));
		}
	}
}