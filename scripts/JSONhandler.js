// This is for reading and writing in the settings.json file.
const fs = require( 'fs' );
const storage = require( 'electron-json-storage' );
const defaultObj = {"windowSize":"1920x1080","fullscreen":false,"language":"en","path": __dirname + "/data","currency":"Euro","chartType":"pie"};
const defaultStorageObj = {"budgets":["checking account"],"currentDate":getCurrentDate(),"allTimeEarnings":[["checking account", 0.0]],"allTimeSpendings":[["checking account", 0.0]]};

/**
 * This function reads a field in the settings.json file.
 * @param {String} name The name of the field we want to access.
 * @return {Object} The corresponding value of the field.
 */
function readPreference( name ) {
    // Check if the file exists. If not, create it.
    var path = storage.getDefaultDataPath() + "/settings.json";
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
    var path = storage.getDefaultDataPath() + "/settings.json";
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
 * @param {JSON} data The data we want to write in form of a JSON object.
 */
function storeData( data ) {
    var dataPath = readPreference( "path" ) + "/" + getCurrentFileName();
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
    // Now we update the reference in our mainStorage.json file.
    updateMainStorage( data );
}

/**
 * This function returns the name of the current file. The current file is the file
 * with the name of the current month. (We will use a new file for each month)
 * @return {String} The name of the current file.
 */
function getCurrentFileName() {
    var currentTime = new Date();
    return (currentTime.getMonth() + 1) < 10 ?
            "0" + (currentTime.getMonth() + 1).toString() + "." + currentTime.getFullYear().toString() + ".json" :
            (currentTime.getMonth() + 1).toString() + "." + currentTime.getFullYear().toString() + ".json";
}

/**
 * This function returns the current date.
 * @return {String} The date of today.
 */
function getCurrentDate() {
    var currentTime = new Date();
    var day = currentTime.getDate() < 10 ? "0" + currentTime.getDate().toString() : currentTime.getDate().toString();
    var month = (currentTime.getMonth() + 1) < 10 ? "0" + (currentTime.getMonth() + 1).toString() : (currentTime.getMonth() + 1).toString();
    var year = currentTime.getFullYear().toString();
    return day + "." + month + "." + year;
}

/**
 * This function initializes the storage. This means, we create a mainStorage.json
 * file if it is missing and we update it. This file keeps track of all the data.
 */
function initMainStorage() {
    var dataPath = readPreference( "path" );
    // Create directory, if it doesn't exist yet.
    if ( !fs.existsSync( dataPath ) ) {
        fs.mkdirSync( dataPath );
    }
    dataPath = readPreference( "path" ) + "/mainStorage.json";
    // Check if the file exists. If not, create it.
    if ( fs.existsSync( dataPath ) ) {
        // File exists, so we check if it needs to get updated.
        var mainStorageObj = JSON.parse( fs.readFileSync( dataPath ) );
        // Missing default budget? Create it.
        if ( mainStorageObj.budgets === undefined ) {
            mainStorageObj.budgets = defaultStorageObj.budgets;
            fs.writeFileSync( dataPath, JSON.stringify( mainStorageObj ) );
        }
        // Set the current date to today.
        mainStorageObj.currentDate = getCurrentDate();
        fs.writeFileSync( dataPath, JSON.stringify( mainStorageObj ) );
    }
    // File does not exist: Create it and write default values in it.
    else {
        fs.appendFileSync( dataPath, JSON.stringify( defaultStorageObj ) );
    }
}

/**
 * This function updates the storage references and some global data.
 * @param {JSON} data The new data we want to process.
 */
function updateMainStorage( data ) {
    // No file for the current month? Create one.
    var path = readPreference( "path" ) + "/" + getCurrentFileName();
    var dataPath = readPreference( "path" ) + "/mainStorage.json";
    // File exists (which should always be the case, see below).
    if ( fs.existsSync( path ) ) {
        var mainStorageObj = JSON.parse( fs.readFileSync( dataPath ) );
        // Determine if a spending or an earning was added.
        var index;
        if ( data.type === "spending" ) {
            index = "allTimeSpendings";
        }
        // Earning was added.
        else if ( data.type === "earning" ) {
            index = "allTimeEarnings";
        }
        // Iterate over all budgets to find the correct one. Then add the cost of
        // the newly aquired item or the sum of the earning.
        for ( var i = 0; i < mainStorageObj[index].length; i++ ) {
            // Found the correct budget?
            if ( mainStorageObj[index][i][0] === data.budget ) {
                // Add the amount to the all time earnings.
                mainStorageObj[index][i][1] += data.amount;
                // Save it and stop looping.
                fs.writeFileSync( dataPath, JSON.stringify( mainStorageObj ) );
                break;
            }
        }
    }
    // This case should never happen since this function gets called from storeData().
    // In storeData(), we already make sure that the file exists (since we write in it).
    else {
        fs.appendFileSync( path, "[" + JSON.stringify( data ) + "]" );
    }
}
