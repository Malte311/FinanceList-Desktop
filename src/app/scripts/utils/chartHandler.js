const Chart = require('chart.js');

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
				}
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
				}
			}
		});
	}

	/**
	 * Creates a chart containing the monthly surpluses for each budget.
	 * 
	 * @param {string} canvas The id of the canvas element which contains the chart.
	 * @param {array} data The input data.
	 */
	createMonthlySurplusChart(canvas, data) {
		let budgets = data.map(d => d.budget).filter((val, ind, self) => self.indexOf(val) === ind);
		let months = data.map(d => {
			return this.view.textData['monthNames'][parseInt(timestampToString(d.date).split('.')[1]) - 1]
		}).filter((val, ind, self) => self.indexOf(val) === ind);

		let datasets = {};
		budgets.forEach(b => {
			datasets[b] = [];
			months.forEach(() => datasets[b].push([0, 0]));
		});

		data.forEach(d => {
			let m = months.indexOf(this.view.textData['monthNames'][parseInt(timestampToString(d.date).split('.')[1]) - 1]);
			datasets[d.budget][m][d.type === 'earning' ? 0 : 1] += parseFloat(d.amount);
		});

		while (budgets.length > this.colors.length) { // Ensure that enough colors are available.
			this.colors = this.colors.concat(this.colors);
		}

		// Ensure that two adjacent parts do not have the same color.
		if (this.colors[budgets.length - 1] === this.colors[0]) {
			this.colors[budgets.length - 1] = this.colorSeparator;
		}

		let backgroundColors = this.colors.map(c => c.replace('1)', '0.3)')); // Opacity

		let dataArr = [], colIndex = 0;
		for (const [key, val] of Object.entries(datasets)) {
			dataArr.push({
				backgroundColor: backgroundColors[colIndex],
				borderColor: this.colors[colIndex++],
				borderWidth: 1,
				data: val.map(v => parseFloat(v[0] - v[1]).toFixed(2)),
				label: key
			});
		}

		new Chart($(canvas), {
			type: 'bar',
			data: {
				labels: months,
				datasets: dataArr,
			},
			options: {
				tooltips: {
					callbacks: {
						label: (ttI, cD) => {
							let sum = this.view.printNum(cD.datasets[ttI.datasetIndex].data[ttI.index]);
							return `${cD.datasets[ttI.datasetIndex].label}: ${sum}`;
						}
					}
				}
			}
		});
	}
}

module.exports = ChartHandler;