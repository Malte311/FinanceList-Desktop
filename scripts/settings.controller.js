/**
 * This function initializes the page when its loaded. This means it sets the
 * language and some of the content.
 */
function loadPage() {
    setLanguage( readPreference( "language" ) );
    // This sets the currently selected window size as a text in the dropdown menu.
    $( "#currentSize" ).text( readPreference( "windowSize" ) );
    // Maybe we need to display checkboxes as checked, if they were previously selected.
    if ( readPreference( "fullscreen" ) === true ) {
        document.getElementById( "fullscreen" ).checked = true;
    }
    // Display currently selected path.
    $( "#currentPath" ).text( readPreference( "path" ) );
    // Display currenctly selected currency.
    $( "#currentCurrency" ).text( readPreference( "currency" ) );
    // Display currenctly selected chart type.
    displayChartType();
}

/**
 * This function sets the size of the application window and stores the currently
 * selected window size in a configutation file.
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
        // Save the new size. We get the existing data and add a value for the language.
        storePreference( "windowSize", newWidth + "x" + newHeight );
        // Display the new size as currently selected.
        $( "#currentSize" ).text( size );
    }
}

/**
 * This function sets the window mode. Available is fullscreen/no fullscreen.
 * @param {String} mode The window mode.
 */
function setWindowMode( mode ) {
    // Find out, if the checkbox was previously checked or unchecked.
    if ( document.getElementById( "fullscreen" ).checked ) {
        // If the checkbox is checked now, it was previously unchecked. This means
        // we will switch to fullscreen.
        win.setFullScreen( true );
        storePreference( "fullscreen", true );
    }
    else {
        win.setFullScreen( false );
        win.center();
        storePreference( "fullscreen", false );
    }
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
        // Show the path as currently selected.
        $( "#currentPath" ).text( newPath );
    }
}

/**
 * This function sets the currency.
 * @param {String} value The name of the currency.
 */
function setCurrency( value ) {
    // Save the value in settings.json.
    storePreference( "currency", value );
    // Show the currently selected currency.
    $( "#currentCurrency" ).text( value );
}

/**
 * This function sets the chart type.
 * @param {String} name The name of the chart type.
 */
function setChartType( name ) {
    // Save the value in settings.json.
    storePreference( "chartType", name );
    displayChartType();
}

/**
 * This function displays the correct chart type. We need to switch case here, since
 * the names are different in various languages.
 */
function displayChartType() {
    var currentChartType = readPreference( "chartType" );
    var currentLanguage = readPreference( "language" );
    // Switch case in case some more languages are added later on.
    switch ( currentLanguage ) {
        case "en":
            // Capitalize the chart type and display it.
            $( "#currentChartType" ).text( readPreference( "chartType" ).replace( /\b\w/g, l => l.toUpperCase() ) + " chart" );
            break;
        case "de":
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
