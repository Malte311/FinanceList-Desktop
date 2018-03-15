// Node FileSystem to read and write in .json files.
const fs = require( 'fs' );
// This is only used to get the DefaultDataPath (some sort of Temp directory).
const storage = require( 'electron-json-storage' );
// A default settings.json object.
const defaultObj = {"windowSize":"1920x1080","fullscreen":false,"language":"en","path": __dirname + "/data","currency":"Euro","chartType":"pie"};
// A default mainStorage.json object.
const defaultStorageObj = {"budgets":[["checking account", 0.0]],"currentDate":getCurrentDate(),"allTimeEarnings":[["checking account", 0.0]],"allTimeSpendings":[["checking account", 0.0]]};
// The path to the settings.json file.
const settingsPath = storage.getDefaultDataPath() + "/settings.json";
// The path to the mainStorage.json file (no constant since the path can be changed at runtime).
var mainStoragePath = readPreference( "path" ) + "/mainStorage.json";

/**
 * This function reads a field in the settings.json file.
 * @param {String} name The name of the field we want to access.
 * @return {Object} The corresponding value of the field.
 */
function readPreference( name ) {
    // Check if the file exists. If not, create it.
    if ( fs.existsSync( settingsPath ) ) {
        var settingsObj = JSON.parse( fs.readFileSync( settingsPath ) );
        // File exists but the value is undefined: Set a default value and return it.
        if ( settingsObj[name] === undefined ) {
            storePreference( name, defaultObj[name] );
            return defaultObj[name];
        }
        // File exists and value is not undefined: Return the corresponding value.
        return settingsObj[name];
    }
    // File does not exist: Create it, write default values and return a default value.
    else {
        fs.appendFileSync( settingsPath, JSON.stringify( defaultObj ) );
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
    if ( fs.existsSync( settingsPath ) ) {
        var settingsObj = JSON.parse( fs.readFileSync( settingsPath ) );
        settingsObj[name] = value;
        fs.writeFileSync( settingsPath, JSON.stringify( settingsObj ) );
    }
    // File does not exist: Create it and write default values in it.
    // When done, we can set the value.
    else {
        // Create default file.
        fs.appendFileSync( settingsPath, JSON.stringify( defaultObj ) );
        // Change the value of the specified field.
        var settingsObj = JSON.parse( fs.readFileSync( settingsPath ) );
        settingsObj[name] = value;
        fs.writeFileSync( settingsPath, JSON.stringify( settingsObj ) );
    }
}

/**
 * This function reads a specified field in the mainStorage.json file.
 * @param {String} field The field we want to read.
 * @return {Object} The corresponding value for the field.
 */
function readMainStorage( field ) {
    // Check if the file exists. If not, create it.
    if ( fs.existsSync( mainStoragePath ) ) {
        var mainStorageObj = JSON.parse( fs.readFileSync( mainStoragePath ) );
        // File exists but the value is undefined: Set a default value and return it.
        if ( mainStorageObj[field] === undefined ) {
            writeMainStorage( field, defaultStorageObj[field] );
            return defaultStorageObj[field];
        }
        // File exists and value is not undefined: Return the corresponding value.
        return mainStorageObj[field];
    }
    // File does not exist: Create it, write default values and return a default value.
    else {
        fs.appendFileSync( mainStoragePath, JSON.stringify( defaultStorageObj ) );
        return defaultStorageObj[field];
    }
}

/**
 * This function writes in the mainStorage.json. It sets a new value for the specified field.
 * @param {String} field The field which value we want to set.
 * @param {Object} value The new value for the specified field.
 */
function writeMainStorage( field, value ) {
    // Check if the file exists. If not, create it.
    if ( fs.existsSync( mainStoragePath ) ) {
        var mainStorageObj = JSON.parse( fs.readFileSync( mainStoragePath ) );
        mainStorageObj[field] = value;
        fs.writeFileSync( mainStoragePath, JSON.stringify( mainStorageObj ) );
    }
    // File does not exist: Create it and write default values in it.
    // When done, we can set the value.
    else {
        // Create default file.
        fs.appendFileSync( mainStoragePath, JSON.stringify( defaultStorageObj ) );
        // Change the value of the specified field.
        var mainStorageObj = JSON.parse( fs.readFileSync( mainStoragePath ) );
        mainStorageObj[field] = value;
        fs.writeFileSync( mainStoragePath, JSON.stringify( mainStorageObj ) );
    }
}

/**
 * This function is for writing user data in .json files (user data means
 * either spendings or earnings; the files are named by date).
 * @param {JSON} data The data we want to write in form of a JSON object.
 */
function storeData( data ) {
    var dataPath = readPreference( "path" ) + "/" + getCurrentFileName();
    // File exists: Write the data in it.
    if ( fs.existsSync( dataPath ) ) {
        // Get existing data, add the new data and then write it.
        // Note that content is an array, because the file contains an array
        // of JSON objects.
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
    return (currentTime.getDate() < 10 ? "0" + currentTime.getDate().toString() : currentTime.getDate().toString()) + "." +
           ((currentTime.getMonth() + 1) < 10 ? "0" + (currentTime.getMonth() + 1).toString() : (currentTime.getMonth() + 1).toString()) + "." +
           currentTime.getFullYear().toString();
}

/**
 * This function moves all files when the path is changed.
 * @param {String} from The path from which all files should be moved.
 * @param {String} to The path to all the files should be moved.
 */
function moveFiles( from, to ) {
    // Get a list of all files.
    var allFiles = fs.readdirSync( from );
    // Now iterate over all the files and move all the .json files.
    for ( var i = 0; i < allFiles.length; i++ ) {
        // We are only interested in .json files.
        if ( allFiles[i].endsWith( ".json" ) ) {
            // Try to move the files (cross disk will cause an error)
            try {
                fs.renameSync( from + "/" + allFiles[i], to + "/" + allFiles[i] );
            }
            // Display the error and stop trying to move files (since the destination
            // will be the same and therefore every file would produce an error).
            catch ( err ) {
                dialog.showErrorBox( "Error", "Cross-device link not permitted." );
                break;
            }
        }
    }
}

/**
 * This function is called when the path is changed. It updates all path references.
 * (Well, "all" path references means the path to the mainStorage.json file at the moment)
 */
function updatePaths() {
    mainStoragePath = readPreference( "path" ) + "/mainStorage.json";
}

/**
 * This function initializes the storage. This means, we create a mainStorage.json
 * file if it is missing or we update it if it exists. This file keeps track of all the data.
 */
function initMainStorage() {
    // Create directory, if it doesn't exist yet.
    var path = readPreference( "path" );
    if ( !fs.existsSync( path ) ) {
        fs.mkdirSync( path );
    }
    // Check if the file exists. If not, create it.
    if ( fs.existsSync( mainStoragePath ) ) {
        // File exists, so we check if it needs to get updated.
        var mainStorageObj = JSON.parse( fs.readFileSync( mainStoragePath ) );
        // Missing default budget? Create it.
        if ( mainStorageObj.budgets === undefined ) {
            mainStorageObj.budgets = defaultStorageObj.budgets;
            fs.writeFileSync( mainStoragePath, JSON.stringify( mainStorageObj ) );
        }
        // Set the current date to today.
        mainStorageObj.currentDate = getCurrentDate();
        fs.writeFileSync( mainStoragePath, JSON.stringify( mainStorageObj ) );
    }
    // File does not exist: Create it and write default values in it.
    else {
        fs.appendFileSync( mainStoragePath, JSON.stringify( defaultStorageObj ) );
    }
}

/**
 * This function updates the storage references and some global data.
 * It gets only called by storeData(), which is defined above.
 * @param {JSON} data The new data we want to process.
 */
function updateMainStorage( data ) {
    // No file for the current month? Create one.
    var path = readPreference( "path" ) + "/" + getCurrentFileName();
    // File exists (which should always be the case, see below).
    if ( fs.existsSync( path ) ) {
        var mainStorageObj = JSON.parse( fs.readFileSync( mainStoragePath ) );
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
                // Earning? Then add the sum to the budget.
                if ( data.type === "earning" ) {
                    mainStorageObj["budgets"][i][1] += data.amount;
                }
                // Save it and stop looping.
                fs.writeFileSync( mainStoragePath, JSON.stringify( mainStorageObj ) );
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
