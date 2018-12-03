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

    createChart(
        document.getElementById( "cashflowChart" ),
        [textElements.spendings, textElements.earnings],
        [totalAmounts[1], totalAmounts[0]],
        ['rgba(255,99,132,0.2)', 'rgba(150, 255, 120, 0.2)'],
        ['rgba(255,99,132,1)', 'rgba(150, 255, 120, 1)'],
        'bar'
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

    new Chart( document.getElementById( "budgetChart" ), {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                data: totalSpendings,
                backgroundColor: 'rgba(255,99,132,0.2)',
                borderColor: 'rgba(255,99,132,1)',
                borderWidth: borderWidth
            },
            {
                data: totalEarnings,
                backgroundColor: 'rgba(150, 255, 120, 0.2)',
                borderColor: 'rgba(150, 255, 120, 1)',
                borderWidth: borderWidth
            }]
        },
        options: {
            tooltips: {
                callbacks: {
                    label: function( tooltipItem, chartData ) {
                        return chartData.labels[tooltipItem.index] + ': ' +
                               chartData.datasets[tooltipItem.datasetIndex].data[tooltipItem.index] + getCurrencySign();
                    }
                }
            },
            legend: {
                    display: false
            },
            // Don't show axes.
            display: false
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
    earnings = parseFloat( beautifyAmount( earnings ) );
    spendings = parseFloat( beautifyAmount( spendings ) );

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
        win.webContents.printToPDF( {}, function( error, data ) {
            if ( error ) {
                console.log( error );
            }
            else {
                writePDF( pdfPath, data );
            }
        });
    }
}
