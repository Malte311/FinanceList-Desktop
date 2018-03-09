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
    // Use the language that was selected before.
    storage.get( "settings", function( error, data ) {
        if ( error ) throw error;
        var language = data.language;
        // If no language was selected before, we set it to default (english).
        if ( language === null || language === undefined ) {
            setLangToEnglish();
        }
        else if ( language === "en" ) {
            setLangToEnglish();
        }
        else if ( language === "de" ) {
            setLangToGerman();
        }
        // This sets the currently selected window size as a text in the dropdown menu.
        $( "#currentSize" ).text( data.windowSize );
        // Maybe we need to display checkboxes as checked, if they were previously selected.
        if ( data.fullscreen === true ) {
            document.getElementById( "fullscreen" ).checked = true;
        }
        // Before displaying the currently selected path, we check if it is defined.
        // If not, we set a default value.
        if ( data.path === undefined || data.path === null ) {
            // TODO
            //data.path = storage.getDefaultDataPath() + "/data";
        }
        // Display currently selected path.
        $( "#currentPath" ).text( data.path );
    });
}

/**
 * This function sets the size of the application window and stores the currently
 * selected window size in a configutation file.
 * @param {String} size The new window size (format has to be like this: "widthxheight").
 */
function setWindowSize( size ) {
    // First, we check which window size was selected before. A resize is only
    // neccessary, if the new size is different than the current one.
    storage.get( "settings", function( error, data ) {
        if ( error ) throw error;
        // Only change the size if a different value than the current one is selected.
        if ( data.windowSize !== size ) {
            // Since the format of size is always "widthxheight", this works.
            var newWidth = parseInt( size.split( "x" )[0] );
            var newHeight = parseInt( size.split( "x" )[1] );
            // Set the new size.
            win.setSize( newWidth, newHeight );
            win.center();
            // Save the new size. We get the existing data and add a value for the language.
            var settingsObj = data;
            settingsObj.windowSize = newWidth + "x" + newHeight;
            storage.set( "settings", settingsObj, function( error ) {
                if ( error ) throw error;
            });
            // Display the new size as currently selected.
            $( "#currentSize" ).text( size );
        }
    });
}

/**
 * This function sets the window mode. Available is fullscreen/no fullscreen.
 * @param {String} mode The window mode.
 */
function setWindowMode( mode ) {
    // We need to read the data first, so we dont override it later (we just want
    // to append values for selected modes).
    storage.get( "settings", function( error, data ) {
        if ( error ) throw error;
        // Get existing data (we don't want to override anything).
        var settingsObj = data;
        // Now we need to find out, if the checkbox was previously checked or unchecked.
        if ( document.getElementById( "fullscreen" ).checked ) {
            // If the checkbox is checked now, it was previously unchecked. This means
            // we will switch to fullscreen.
            win.setFullScreen( true );
            settingsObj.fullscreen = true;
        }
        else {
            win.setFullScreen( false );
            win.center();
            settingsObj.fullscreen = false;
        }
        // Save the new data.
        storage.set( "settings", settingsObj, function( error ) {
            if ( error ) throw error;
        });
    });
}

/**
 * This function sets the path to the directory which should contain the user data.
 * The path will be saved in the configuration file to remember it.
 */
function setPath() {
    // Get the new path from user input.
    var path = dialog.showOpenDialog({
        properties: ['openDirectory']
    });
    // As always, we get existing data, to be able to append new data.
    storage.get( "settings", function( error, data ) {
        if ( error ) throw error;
        // Make sure that the user did not cancel the selection.
        if ( path !== null && path !== undefined ) {
            // Save the new path in the configuration file.
            var settingsObj = data;
            // Path is an one element array, so we take only the content.
            settingsObj.path = path[0];
            storage.set( "settings", settingsObj, function( error ) {
                if ( error ) throw error;
            });
        }
    });
}
