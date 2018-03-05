// Stores the settings
var settings;
/**
 * This function loads the settings or sets default values, if no configuration
 * file can be found.
 */
function loadSettings() {

    var request = new XMLHttpRequest();
    request.onreadystatechange = function() {
        if ( this.readyState == 4 && this.status == 200 ) {
            settings = JSON.parse( this.responseText );
        }
    }
    request.open( 'GET', '../settings.json', true );
    request.send();

    console.log( settings );
}
