/**************************************************************************************************
 * This file is responsible for the view on the settings page.
**************************************************************************************************/

/**
 * This function displays the correct chart type. We need to switch case here, since
 * the names are different in various languages.
 */
function displayChartType() {
    // Select the correct text in dependency of the language and the selected chart type.
    var currentChartType = readPreference( "chartType" );
    switch ( getLanguage() ) {
        case "en":
            // Capitalize the chart type and display it.
            $( "#currentChartType" ).text( currentChartType.replace( /\b\w/g, l => l.toUpperCase() ) + " chart" );
            break;
        case "de":
            // In German it is a bit more difficult. We need another identifier
            // for each chart type.
            if ( currentChartType === "pie" ) {
                $( "#currentChartType" ).text( "Kreisdiagramm" );
            }
            else if ( currentChartType === "line" ) {
                $( "#currentChartType" ).text( "Liniendiagramm" );
            }
            else if ( currentChartType === "bar" ) {
                $( "#currentChartType" ).text( "Balkendiagramm" );
            }
            else if ( currentChartType === "doughnut" ) {
                $( "#currentChartType" ).text( "Ringdiagramm" );
            }
            break;
    }
}

/**
 * This function updates the view when changes are made.
 */
function updateView() {
    // This sets the currently selected window size as a text in the dropdown menu.
    $( "#currentSize" ).text( readPreference( "windowSize" ) );
    // Maybe we need to display checkboxes as checked, if they were previously selected.
    if ( readPreference( "fullscreen" ) === true ) {
        $( "#fullscreen" )[0].checked = true;
    }
    // Display currently selected path.
    $( "#currentPath" ).text( readPreference( "path" ) );
    // Display currenctly selected currency.
    $( "#currentCurrency" ).text( readPreference( "currency" ) );
    // Display currenctly selected chart type.
    displayChartType();
}
