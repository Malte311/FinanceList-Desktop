// These are neccessary to set the window size.
const { remote } = require( 'electron' );
const win = remote.getCurrentWindow();
// This is for writing in the settings.json file.
const storage = require( 'electron-json-storage' );

/**
 * This function initializes the page when its loaded.
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
        $( "#currentSize" ).text( data.windowSize );
    });
}

/**
 * This function shows only elements with lang=de attribute.
 */
function setLangToGerman() {
    // Set the new language.
    $("[lang=en]").hide();
    $("[lang=de]").show();
    // Save the new language.
    storage.set( "settings", { "language": "de" }, function( error ) {
        if ( error ) throw error;
    });
}

/**
 * This function shows only elements with lang=en attribute.
 */
function setLangToEnglish() {
    // Set the new language.
    $("[lang=de]").hide();
    $("[lang=en]").show();
    // Save the new language.
    storage.set( "settings", { "language": "en" }, function( error ) {
        if ( error ) throw error;
    });
}

/**
 * This function sets the size of the application window.
 * @param {String} size The new window size (format has to be like this: "widthxheight").
 */
function setWindowSize( size ) {
    storage.get( "settings", function( error, data ) {
        if ( error ) throw error;
        // Only change the size if a different value than the current one is selected.
        if ( data.windowSize !== size ) {
            // Since the format of size is "widthxheight", this works.
            var newWidth = parseInt( size.split( "x" )[0] );
            var newHeight = parseInt( size.split( "x" )[1] );
            // Set the new size.
            win.setSize( newWidth, newHeight );
            // Save the new size.
            storage.set( "settings", { "windowSize": newWidth + "x" + newHeight }, function( error ) {
                if ( error ) throw error;
            });
            // Display the new size as currently selected.
            $( "#currentSize" ).text( size );
        }
    });
}
