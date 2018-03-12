// These are neccessary to set the window size.
const { remote } = require( 'electron' );
const win = remote.getCurrentWindow();
// Module for setting the path.
const { dialog } = require( 'electron' ).remote;

/**
 * This function initializes the page when its loaded. This means it sets the
 * language and some of the content.
 */
function loadPage() {
    setLanguage();
    // This sets the currently selected window size as a text in the dropdown menu.
    $( "#currentSize" ).text( readPreference( "windowSize" ) );
    // Maybe we need to display checkboxes as checked, if they were previously selected.
    if ( readPreference( "fullscreen" ) === true ) {
        document.getElementById( "fullscreen" ).checked = true;
    }
    // Display currently selected path.
    $( "#currentPath" ).text( readPreference( "path" ) );
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
    if ( path !== null && path !== undefined ) {
        // Save the new path in the configuration file.
        storePreference( "path", newPath );
    }
}
