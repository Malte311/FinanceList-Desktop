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
 * This function sets the window mode. Available is fullscreen/no fullscreen.
 */
function setWindowMode() {
    // If the checkbox is checked now, it was previously unchecked. This means
    // we will switch to fullscreen.
    if ( $( "#fullscreen" ).is( ":checked" ) ) {
        win.setFullScreen( true );
        storePreference( "fullscreen", true );
    }
    // Otherwise we switch back to window mode.
    else {
        win.setFullScreen( false );
        win.center();
        storePreference( "fullscreen", false );
    }
    // No updateView() required here, since the checkbox change its state automatically.
}

/**
 * This function sets the path to the directory which should contain the user data.
 * The path will be saved in the configuration file to remember it.
 */
function setPath() {
    // Get the new path from user input.
    var newPath = dialog.showOpenDialog({
        properties: ['openDirectory']
    });
    // Make sure that a new path was selected and that the new path is a different one than the old one.
    if ( newPath !== null && newPath !== undefined && newPath[0] !== readPreference( "path" ) ) {
        // Move all files to the new location
        moveFiles( readPreference( "path" ), newPath[0] );
        // Save the new path in the configuration file.
        // (Since newPath is a one element array containing the path, we just take
        // the path instead of the whole array.)
        storePreference( "path", newPath[0] );
        // Update paths references in JSONhandler.js (has to be called after storing it)
        updatePaths();
        // Update the view to display the newly selected path.
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