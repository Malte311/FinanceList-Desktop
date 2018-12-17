/**
 * This file creates a PDF view.
 *
 * @author Malte311
 */

// For file selection
const urlParams = new URLSearchParams( window.location.search );
const selectedMonth = urlParams.get( 'month' );

/**
 * Initializes the PDF view page.
 */
function initPdfView() {
    borderWidth = 2;

    createCashflowChart();
    createBudgetChart();

    borderWidth = 0;
}

/**
 * Creates the cashflow chart.
 */
function createCashflowChart() {
    var data = getData( selectedMonth + ".json",
                        { connector:'or', params:[["type", "earning"], ["type", "spending"]] } );

    var totalAmounts = getTotalAmount( data );

    var datasets = [{
        data: [
            beautifyAmount( totalAmounts[1] ),
            beautifyAmount( totalAmounts[0] )
        ],
        backgroundColor: ['rgba(255,99,132,1)', 'rgba(150, 255, 120, 1)'],
        borderColor: ['rgba(255,99,132,1)', 'rgba(150, 255, 120, 1)'],
        borderWidth: borderWidth
    }];

    createPrintChart(
        document.getElementById( "cashflowChart" ),
        [textElements.spendings, textElements.earnings],
        datasets,
        'doughnut'
    );
}

/**
 * Creates the budget chart.
 */
function createBudgetChart() {
    var currentBudgets = readMainStorage( "budgets" );

    var labels = [], totalEarnings = [], totalSpendings = [];
    for ( var i = 0; i < currentBudgets.length; i++ ) {
        var data = getData( selectedMonth + ".json",
                            { connector:'or', params:[["budget", currentBudgets[i][0]]] } );

        labels.push( currentBudgets[i][0] );
        var totalAmounts = getTotalAmount( data );
        totalEarnings.push( totalAmounts[0] );
        totalSpendings.push( totalAmounts[1] );
    }

    var datasets = [{
        label: textElements.spendings,
        data: totalSpendings,
        backgroundColor: 'rgba(255,99,132,0.2)',
        borderColor: 'rgba(255,99,132,1)',
        borderWidth: borderWidth
    },
    {
        label: textElements.earnings,
        data: totalEarnings,
        backgroundColor: 'rgba(150, 255, 120, 0.2)',
        borderColor: 'rgba(150, 255, 120, 1)',
        borderWidth: borderWidth
    }];

    createPrintChart(
        document.getElementById( "budgetChart" ),
        labels,
        datasets,
        'bar'
    );
}

/**
 * Creates charts for printing to PDF format.
 * @param {Object} canvas The canvas which contains the chart.
 * @param {String[]} labels The labels for the data.
 * @param {Object[]} datasets The data that will be visualized.
 * @param {String} charttype The type of the chart.
 */
function createPrintChart( canvas, labels, datasets, charttype ) {
    new Chart( canvas, {
        type: charttype,
        data: {
            labels: labels,
            datasets: datasets
        },
        options: {
            tooltips: {
                callbacks: {
                    label: function( tooltipItem, chartData ) {
                        return chartData.labels[tooltipItem.index] + ': ' +
                               chartData.datasets[0].data[tooltipItem.index] + getCurrencySign();
                    }
                }
            },
            plugins: {
                labels: {
                    render: function( args ) {
                        return "" + args.value + getCurrencySign();
                    },
                    showZero: true
                }
            }
        }
    });
}

/**
 * Returns the total amount of earnings and spendings of some given data.
 * @param {Object} data The given data.
 * @return {number[]} The total earnings at index 0, total spendings at index 1.
 */
function getTotalAmount( data ) {
    var earnings = 0, spendings = 0;
    for ( var i = 0; i < data.length; i++ ) {
        if ( data[i].type === "earning" ) {
            earnings = Math.round( (earnings + data[i].amount) * 1e2 ) / 1e2;
        }
        else {
            spendings = Math.round( (spendings + data[i].amount) * 1e2 ) / 1e2;
        }
    }
    earnings = beautifyAmount( earnings );
    spendings = beautifyAmount( spendings );

    return [earnings, spendings];
}

/**
 * Monthly overview for PDF export.
 */
function printToPDF() {
    var pdfPath = dialog.showOpenDialog({
        properties: ['openDirectory']
    });

    if ( pdfPath !== null && pdfPath !== undefined ) {
        win.webContents.printToPDF( {pageSize: 'A4', printBackground: false}, function( error, data ) {
            if ( error ) {
                console.log( error );
            }
            else {
                writePDF( pdfPath, data );
            }
        });
    }
}
