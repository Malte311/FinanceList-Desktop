// This is for reading and writing in the settings.json file.
const fs = require( 'fs' );
const storage = require( 'electron-json-storage' );
const path = storage.getDefaultDataPath() + "/settings.json";
const defaultObj = {"windowSize":"1920x1080","fullscreen":false,"language":"en","path": __dirname + "/data","currency":"Euro","chartType":"pie"};
const defaultStorageObj = {"budgets":["checking account"]};

/**
 * This function reads a field in the settings.json file.
 * @param {String} name The name of the field we want to access.
 * @return {Object} The corresponding value of the field.
 */
function readPreference( name ) {
    // Check if the file exists. If not, create it.
    if ( fs.existsSync( path ) ) {
        var settingsObj = JSON.parse( fs.readFileSync( path ) );
        // File exists but the value is undefined:
        if ( settingsObj[name] === undefined ) {
            storePreference( name, defaultObj[name] );
            return defaultObj[name];
        }
        // File exists and value is not undefined:
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

/**
 * This function is for writing user data in .json files.
 * @param {String} file The name of the file the data should be written in.
 * @param {JSON} data The data we want to write in form of a JSON object.
 */
function storeData( file, data ) {
    var dataPath = readPreference( "path" ) + "/" + file + ".json";
    // File exists: Write the data in it.
    if ( fs.existsSync( dataPath ) ) {
        // Get existing data, add the new data and then write it.
        // Note that content is an array, because the file contains an array
        // containing JSON objects.
        var content = JSON.parse( fs.readFileSync( dataPath ) );
        content.push( data );
        fs.writeFileSync( dataPath, JSON.stringify( content ) );
    }
    // File does not exist: Create it and write the data in it.
    else {
        // The content is an array containing JSON objects.
        fs.appendFileSync( dataPath, "[" + JSON.stringify( data ) + "]" );
    }
}

// TODO: Improve this function ************************************************

/**
 * This function reads a field in the mainStorage.json file.
 * @param {String} name The name of the field we want to access.
 * @return {Object} The corresponding value of the field.
 */
function readData( name ) {
    var dataPath = readPreference( "path" ) + "/mainStorage.json";
    // Check if the file exists. If not, create it.
    if ( fs.existsSync( dataPath ) ) {
        var mainStorageObj = JSON.parse( fs.readFileSync( dataPath ) );
        // File exists but the value is undefined:
        if ( mainStorageObj[name] === undefined ) {
            storePreference( name, defaultStorageObj[name] );
            return defaultStorageObj[name];
        }
        // File exists and value is not undefined:
        return mainStorageObj[name];
    }
    // File does not exist: Create it and write default values in it.
    else {
        fs.appendFileSync( dataPath, JSON.stringify( defaultStorageObj ) );
        return defaultStorageObj[name];
    }
}
