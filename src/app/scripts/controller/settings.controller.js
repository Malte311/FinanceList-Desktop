/**
 * This file controls all actions on the settings page.
 *
 * @module settingsController
 * @author Malte311
 */

const electron = require( 'electron' );

/**
 * This function initializes the page when its loaded. This means it sets the
 * language and the dynamic content.
 */
function loadPage() {
    // Select the correct language.
    setLanguage( readPreference( "language" ) );
    // Display everything else.
    updateView();
}

/**
 * This function sets the size of the application window and stores the currently
 * selected window size in a configuration file.
 * @param {String} size The new window size (format has to be like this: "widthxheight").
 */
function setWindowSize( size ) {
    // First, we check which window size was selected before. A resize is only
    // neccessary, if the new size is different than the current one.
    if ( readPreference( "windowSize" ) !== size ) {
        // Since the format of size is always "widthxheight", this works.
        var newWidth = parseInt( size.split( "x" )[0] );
        var newHeight = parseInt( size.split( "x" )[1] );
        // Set the new size.
        win.setSize( newWidth, newHeight );
        win.center();

        // Maximize window if it is at least as big as the screen size
        var mainScreenWidth = electron.screen.getPrimaryDisplay().size.width;
        var mainScreenHeight = electron.screen.getPrimaryDisplay().size.height;
        if ( newWidth >= mainScreenWidth && newHeight >= mainScreenHeight ) {
            win.maximize();
        }

        // Save the new size. We get the existing data and add a value for the language.
        storePreference( "windowSize", newWidth + "x" + newHeight );
        // Update the view to display the newly selected size.
        updateView();
    }
}

/**
 * This function sets the currency.
 * @param {String} value The name of the currency.
 */
function setCurrency( value ) {
    // Save the value in settings.json.
    storePreference( "currency", value );
    // Update the view to display the newly selected currency.
    updateView();
}

/**
 * This function sets the chart type.
 * @param {String} name The name of the chart type.
 */
function setChartType( name ) {
    // Save the value in settings.json.
    storePreference( "chartType", name );
    // Update the view to display the new chart type.
    updateView();
}