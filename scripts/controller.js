const Chart = require( 'chart.js' );

/**
 * This function sets the language.
 */
function setLanguage() {
    // Use the language that was selected before.
    var language = readPreference( "language" );
    if ( language === "en" ) {
        setLangToEnglish();
    }
    else if ( language === "de" ) {
        setLangToGerman();
    }
}

/**
 * This function shows only elements with lang=de attribute and hides all elements
 * with a different language attribute.
 */
function setLangToGerman() {
    // Set the new language.
    $( "[lang=en]" ).hide();
    $( "[lang=de]" ).show();
    // Save the new language.
    storePreference( "language", "de" );
}

/**
 * This function shows only elements with lang=en attribute and hides all elements
 * with a different language attribute.
 */
function setLangToEnglish() {
    // Set the new language.
    $( "[lang=de]" ).hide();
    $( "[lang=en]" ).show();
    // Save the new language.
    storePreference( "language", "en" );
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
                borderWidth: 1
            }]
        },
        // Don't show axes.
        options: {
            display: false
        }
    });
}
