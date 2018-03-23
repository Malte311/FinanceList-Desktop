const Chart = require( 'chart.js' );
// Electron is needed for further modules.
const { remote } = require( 'electron' );
// Module for dialogues (needed when setting the path or to display error messages).
const { dialog } = require( 'electron' ).remote;
// Neccessary to set the window size.
const win = remote.getCurrentWindow();
// This saves available colors for charts.
const colors = ['rgba(255,99,132,1)', 'rgba(54, 162, 235, 1)', 'rgba(255, 206, 86, 1)', 'rgba(75, 192, 192, 1)', 'rgba(153, 102, 255, 1)', 'rgba(255, 159, 64, 1)'];

/**
 * This function sets the language.
 * @param {String} language The new language.
 */
function setLanguage( language ) {
    // Display the new language.
    switch ( language ) {
        case "en":
            $( "[lang=de]" ).hide();
            $( "[lang=en]" ).show();
            break;
        case "de":
            $( "[lang=en]" ).hide();
            $( "[lang=de]" ).show();
            break;
    }
    // Save the new language.
    storePreference( "language", language );
}

/**
 * This function returns the currently selected language.
 * @return {String} The currently selected language.
 */
function getLanguage() {
    // Find out, which language is selected and return it.
    var currentLanguage = readPreference( "language" );
    switch ( currentLanguage ) {
        case "en":
            return "en";
        case "de":
            return "de";
        default:
            return "en";
    }
}

/**
 * This function return the currency sign.
 * @return {String} An HTML representation of the currency sign.
 */
function getCurrencySign() {
    // Find out, which currency is selected and choose the appropriate sign.
    var currentCurrency = readPreference( "currency" );
    switch ( currentCurrency ) {
        case "Euro":
            return "&euro;";
        case "Dollar":
            return "&dollar;";
        case "Pound":
            return "&pound;";
        default:
            return "&euro;";
    }
}

/**
 * Creates a pie chart to visualize the input data.
 * @param {Object} canvas The canvas which contains the diagram.
 * @param {String[]} categories The labels for the data.
 * @param {number[]} dataset The data that will be visualized.
 * @param {Object[]} bgcolors Backgroundcolors in the diagram.
 * @param {Object[]} bdcolors Bordercolors in the diagram.
 * @param {String} charttype The type of the chart.
 */
function createChart( canvas, categories, dataset, bgcolors, bdcolors, charttype ) {
     spendingChart = new Chart( canvas, {
        type: charttype,
        data: {
            labels: categories,
            datasets: [{
                data: dataset,
                backgroundColor: bgcolors,
                borderColor: bdcolors,
                borderWidth: 0
            }]
        },
        // Don't show axes.
        options: {
            display: false,
        }
    });
}
