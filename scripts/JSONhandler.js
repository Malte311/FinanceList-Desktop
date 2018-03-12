// This is for reading and writing in the settings.json file.
const fs = require( 'fs' );
const storage = require( 'electron-json-storage' );
const path = storage.getDefaultDataPath() + "/settings.json";
const defaultObj = {"windowSize":"1920x1080","fullscreen":false,"language":"en","path": __dirname + "/data"};

/**
 * This function reads a field in the settings.json file.
 * @param {String} name The name of the field we want to access.
 * @return {Object} The corresponding value of the field.
 */
function readPreference( name ) {
    // Check if the file exists. If not, create it.
    if ( fs.existsSync( path ) ) {
        var settingsObj = JSON.parse( fs.readFileSync( path ) );
        return settingsObj[name];
    }
    // File does not exist: Create it and write default values in it.
    else {
        fs.appendFileSync( path, JSON.stringify( defaultObj ) );
        return defaultObj[name];
    }
}

/**
 * This function saves a value in the settings.json file.
 * @param {String} name The name of the field we want to access.
 * @param {Object} value The value we want to set for the corresponding field.
 */
function storePreference( name, value ) {
    // Check if the file exists. If not, create it.
    if ( fs.existsSync( path ) ) {
        var settingsObj = JSON.parse( fs.readFileSync( path ) );
        settingsObj[name] = value;
        fs.writeFileSync( path, JSON.stringify( settingsObj ) );
    }
    // File does not exist: Create it and write default values in it.
    else {
        fs.appendFileSync( path, JSON.stringify( defaultObj ) );
    }
}
