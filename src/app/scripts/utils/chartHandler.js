require('chart.js/auto');
const {Chart} = require('chart.js');

const {timestampToString} = require(__dirname + '/dateHandler.js');

/**
 * Class for creating charts.
 */
class ChartHandler {
	/**
	 * @param {View} view View object.
	 */
	constructor(view) {
		this.view = view;

		this.colors = [
			'rgba(0, 123, 255, 1)',
			'rgba(255, 159, 64, 1)',
			'rgba(40, 167, 69, 1)',
			'rgba(255, 193, 7, 1)',
			'rgba(220, 53, 69, 1)'
		];
		this.colorSeparator = 'rgba(153, 102, 255, 1)';
	}

	/**
	 * Creates a chart in a given canvas to visualize the input data.
	 * 
	 * @param {string} canvas The id of the canvas element which contains the chart.
	 * @param {array} data The input data.
	 */
	createChart(canvas, data) {
		switch (this.view.storage.readPreference('chartType')) {
			case 'bar':
				this.createMonthlySurplusChart(canvas, data);
				break;
			case 'doughnut':
				this.createCategoryChart(canvas, data);
				break;
			case 'line':
				this.createEarnSpendChart(canvas, data);
				break;
			case 'pie':
				this.createTransactionChart(canvas, data);
				break;
			default:
				this.createTransactionChart(canvas, data);
				break;
		}
	}

	/**
	 * Creates a chart containing the transactions (name, amount) as dataset.
	 * 
	 * @param {string} canvas The id of the canvas element which contains the chart.
	 * @param {array} data The input data.
	 */
	createTransactionChart(canvas, data) {
		while (data.length > this.colors.length) { // Ensure that enough colors are available.
			this.colors = this.colors.concat(this.colors);
		}

		// Ensure that two adjacent parts do not have the same color.
		if (this.colors[data.length - 1] === this.colors[0]) {
			this.colors[data.length - 1] = this.colorSeparator;
		}

		let backgroundColors = this.colors.map(c => c.replace('1)', '0.3)')); // Opacity

		new Chart($(canvas), {
			type: 'pie',
			data: {
				labels: data.map(d => d.name),
				datasets: [{
					data: data.map(d => parseFloat(d.amount).toFixed(2)),
					backgroundColor: backgroundColors,
					borderColor: this.colors,
					borderWidth: 1
				}]
			},
			options: {
				tooltips: {
					callbacks: {
						label: (ttI, cD) => {
							let sum = this.view.printNum(cD.datasets[0].data[ttI.index]);
							return `${cD.labels[ttI.index]}: ${sum}`;
						}
					}
				},
				responsive: false,
			}
		});
	}

	/**
	 * Creates a chart containing the categories (category name, combined amount of
	 * transactions belonging to that category) as dataset.
	 * 
	 * @param {string} canvas The id of the canvas element which contains the chart.
	 * @param {array} data The input data.
	 */
	createCategoryChart(canvas, data) {
		let dataObj = {};
		let cats = data.map(d => d.category).filter((val, ind, self) => self.indexOf(val) === ind);
		
		cats.forEach(c => dataObj[c] = 0);
		data.forEach(d => dataObj[d.category] += parseFloat(d.amount));

		let plotData = [[], []]; // Make sure to keep labels and data in the correct order
		for (const [key, val] of Object.entries(dataObj)) {
			plotData[0].push(key);
			plotData[1].push(val);
		}

		while (plotData[0].length > this.colors.length) { // Ensure that enough colors are available.
			this.colors = this.colors.concat(this.colors);
		}

		// Ensure that two adjacent parts do not have the same color.
		if (this.colors[plotData[0].length - 1] === this.colors[0]) {
			this.colors[plotData[0].length - 1] = this.colorSeparator;
		}

		let backgroundColors = this.colors.map(c => c.replace('1)', '0.3)')); // Opacity

		new Chart($(canvas), {
			type: 'doughnut',
			data: {
				labels: plotData[0],
				datasets: [{
					data: plotData[1].map(d => parseFloat(d).toFixed(2)),
					backgroundColor: backgroundColors,
					borderColor: this.colors,
					borderWidth: 1
				}]
			},
			options: {
				tooltips: {
					callbacks: {
						label: (ttI, cD) => {
							let sum = this.view.printNum(cD.datasets[0].data[ttI.index]);
							return `${cD.labels[ttI.index]}: ${sum}`;
						}
					}
				},
				responsive: false,
			}
		});
	}

	/**
	 * Creates a chart containing the monthly surpluses for all budgets combined.
	 * 
	 * @param {string} canvas The id of the canvas element which contains the chart.
	 * @param {array} data The input data.
	 */
	createMonthlySurplusChart(canvas, data) {
		let months = this.view.textData['monthNames'];
		let plotData = [];
		
		months.forEach((m, index) => plotData[index] = [0, 0]);
		data.forEach(d => {
			let i = d.type === 'earning' ? 0 : 1;
			plotData[parseInt(timestampToString(d.date).split('.')[1] - 1)][i] += parseFloat(d.amount);
		});

		while (months.length > this.colors.length) { // Ensure that enough colors are available.
			this.colors = this.colors.concat(this.colors);
		}

		// Ensure that two adjacent parts do not have the same color.
		if (this.colors[months.length - 1] === this.colors[0]) {
			this.colors[months.length - 1] = this.colorSeparator;
		}

		let backgroundColors = this.colors.map(c => c.replace('1)', '0.3)')); // Opacity

		new Chart($(canvas), {
			type: 'bar',
			data: {
				labels: months,
				datasets: [{
					data: plotData.map(d => parseFloat(d[0] - d[1]).toFixed(2)),
					backgroundColor: backgroundColors,
					borderColor: this.colors,
					borderWidth: 1
				}]
			},
			options: {
				tooltips: {
					callbacks: {
						label: (ttI, cD) => {
							let sum = this.view.printNum(cD.datasets[0].data[ttI.index]);
							return `${cD.labels[ttI.index]}: ${sum}`;
						}
					}
				},
				plugins: {
					legend: {
						display: false,
					},
				},
				responsive: false,
			}
		});
	}

	/**
	 * Creates a chart containing the earnings and spendings per day.
	 * 
	 * @param {string} canvas The id of the canvas element which contains the chart.
	 * @param {array} data The input data.
	 */
	createEarnSpendChart(canvas, data) {
		let dataObj = {};

		data.map(d => timestampToString((new Date(d.date))))
			.filter((val, ind, self) => self.indexOf(val) === ind)
			.forEach(d => dataObj[d] = [0, 0]);
		
		data.forEach(d => dataObj[timestampToString(new Date(d.date))][d.type === 'earning' ? 0 : 1] += parseFloat(d.amount));

		let plotData = [[], []]; // Make sure to keep labels and data in the correct order
		
		let labels = Object.keys(dataObj).sort((a, b) => {
			return a.split('.').reverse().join('.') < b.split('.').reverse().join('.') ? -1 : 1;
		});
		
		labels.forEach(key => {
			plotData[0].push(dataObj[key][0]);
			plotData[1].push(dataObj[key][1]);
		});

		new Chart($(canvas), {
			type: 'line',
			data: {
				labels: labels,
				datasets: [{
					data: plotData[0].map(d => parseFloat(d).toFixed(2)),
					backgroundColor: 'rgba(40, 167, 69, 0.3)',
					borderColor: 'rgba(40, 167, 69, 1)',
					borderWidth: 1,
					label: this.view.textData['earnings']
				}, {
					data: plotData[1].map(d => parseFloat(d).toFixed(2)),
					backgroundColor: 'rgba(220, 53, 69, 0.3)',
					borderColor: 'rgba(220, 53, 69, 1)',
					borderWidth: 1,
					label: this.view.textData['spendings']
				}]
			},
			options: {
				tooltips: {
					callbacks: {
						label: (ttI, cD) => {
							let sum = this.view.printNum(cD.datasets[ttI.datasetIndex].data[ttI.index]);
							return `${cD.labels[ttI.index]}: ${sum}`;
						}
					}
				},
				responsive: false,
			}
		});
	}
}

module.exports = ChartHandler;