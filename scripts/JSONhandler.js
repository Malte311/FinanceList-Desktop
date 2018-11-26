/**
 * This file is for handling the storage (.json files).
 * It does everything related to files and directories.
 *
 * @author Malte311
 */

// Node FileSystem to read and write in .json files.
const fs = require( 'fs' );
// This is only used to get the DefaultDataPath (some sort of Temp directory).
const storage = require( 'electron-json-storage' );
// We use this module to get the correct path seperator (only needed to display it correctly).
const path = require( 'path' );
const os = require( 'os' );
// A default settings.json object.
const defaultObj = {"windowSize":"1920x1080","fullscreen":false,"language":"en",
                    "path": storage.getDefaultDataPath() + path.sep + "data",
                    "currency":"Euro","chartType":"pie"};
// A default mainStorage.json object.
const defaultStorageObj = {"budgets":[["checking account", 0.0]],"currentDate":getCurrentDate(),
                           "allTimeEarnings":[["checking account", 0.0]],
                           "allTimeSpendings":[["checking account", 0.0]],"allocationOn":false,
                           "allocation":[["checking account", 100]],"recurring":[],"update":false,
                           "availableNames":[],"availableCategories":[]};
// The path to the settings.json file.
const settingsPath = storage.getDefaultDataPath() + path.sep + "settings.json";
// The path to the mainStorage.json file (no constant since the path can be changed at runtime).
var mainStoragePath = readPreference( "path" ) + path.sep + "mainStorage.json";
var currentFile = readPreference( "path" ) + path.sep + getCurrentFileName();
// This is for reading the settings.json file in the main process.
module.exports.readPreference = ( name ) => readPreference( name );
module.exports.storePreference = ( name, value ) => storePreference( name, value );
module.exports.initStorage = () => initStorage();

/**
 * This function initializes the storage. This means, we create a mainStorage.json
 * file if it is missing or we update it if it exists. This file keeps track of all the data.
 * The initMainStorage() function is called when the application is started.
 */
function initStorage() {
    // Create directories, if they doesn't exist yet.
    var path = readPreference( "path" );
    if ( !fs.existsSync( path ) ) {
        createPath( path );
    }

    // Create the current file, if it is missing
    if ( !fs.existsSync(currentFile) ) {
        fs.appendFileSync( currentFile, "[]" );
    }

    // Check if the mainstorage file exists. If not, create it.
    if ( fs.existsSync( mainStoragePath ) ) {
        // File exists, so we check if it needs to get updated.
        var mainStorageObj = JSON.parse( fs.readFileSync( mainStoragePath ) );
        // Missing default budget? Create it.
        if ( mainStorageObj.budgets === undefined
                || mainStorageObj.budgets.length < 1
                || mainStorageObj.budgets.length === undefined ) {
            writeMainStorage( "budgets", defaultStorageObj.budgets );
        }
        // Set the current date to today.
        writeMainStorage( "currentDate", getCurrentDate() );
        // Set update to false, because the check for updates did not happen yet.
        writeMainStorage( "update", false );
    }
    // File does not exist: Create it and write default values in it.
    else {
        fs.appendFileSync( mainStoragePath, JSON.stringify( defaultStorageObj ) );
    }
}

/**
 * This function creates missing paths.
 */
function createPath( newPath ) {
    var start;
    if ( os.platform() === "win32" ) {
        start = "";
    }
    else {
        start = "/";
    }
	newPath.split( path.sep ).forEach( function ( folder ) {
		if ( folder.length > 0 ) {
			start += folder + path.sep;
			if ( !fs.existsSync( start ) ) {
				fs.mkdirSync( start );
			}
		}
	});
}

/**
 * This function reads a field in the settings.json file.
 * @param {String} name The name of the field we want to access.
 * @return {Object} The corresponding value of the field.
 */
function readPreference( name ) {
    // Path missing? Create it.
    var path = storage.getDefaultDataPath();
    if ( !fs.existsSync( path ) ) {
        createPath( path );
    }
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
    // Path missing? Create it.
    var path = storage.getDefaultDataPath();
    if ( !fs.existsSync( path ) ) createPath( path );
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
 * This function reads user data (earnings/spendings) in a specified file.
 * @param {String} file The file we want to access (with .json ending!).
 * @param {JSON} quest Contains a connector (or/and) and an array of parameter to
 * filter objects. Example:
 * quest = { connector : "or", params : [["type", "earning"],["budget", "checking account"]] }
 * @return {JSON[]} All the data which matches the quest.
 */
function getData( file, quest ) {
    // Get the data object we want to access.
    var dataPath = readPreference( "path" ) + path.sep + file;
    // Before we continue, we make sure that the file exists.
    if ( fs.existsSync( dataPath ) ) {
        var dataStorageObj = JSON.parse( fs.readFileSync( dataPath ) );
        // Filter the data and return an array with appropriate data.
        var data = dataStorageObj.filter( (dat) => {
            var ret = null;
            quest.params.some( (qu) => {
                // We do not need an exact match, e.g. when searching for "ticket", we want to
                // find entries called "bus ticket"
                if ( qu[0] === "name" || qu[0] === "category" ) {
                    // At least one param matched? Return true (ret=true) because connector is "or".
                    if ( quest.connector === "or" ) {
                        if ( dat[qu[0]].toLowerCase().includes(qu[1].toLowerCase()) ) {
                            ret = true;
                            return true;
                        }
                    }
                    // One param does not match => "and" connector can not be satisfied (ret=false).
                    else {
                        if ( !dat[qu[0]].toLowerCase().includes(qu[1].toLowerCase()) ) {
                            ret = false;
                            return true;
                        }
                    }
                }
                // Exact match is neccessary for all other fields
                else {
                    // At least one param matched? Return true (ret=true) because connector is "or".
                    if ( quest.connector === "or" ) {
                        if ( dat[qu[0]] === qu[1] ) {
                            ret = true;
                            return true;
                        }
                    }
                    // One param does not match => "and" connector can not be satisfied (ret=false).
                    else {
                        if ( dat[qu[0]] !== qu[1] ) {
                            ret = false;
                            return true;
                        }
                    }
                }
            });
            // Return the value of ret as explained above.
            if ( ret !== null ) return ret;
            // We only get to this point when (1) connector = "or" and no match was found,
            // (2) connector = "and" and no mismatch was found.
            return ( quest.connector === "or" ) ? false : true;
        });
        // Display partitioned entries as one entry. Only neccessary for earnings, since
        // spendings can not be partitioned.
        var toJoin = [];
        var allJoins = [];
        for ( var i = 0; i < data.length - 1; i++ ) {
            // The timestamp acts as an identifier since it is unique
            // (data is sorted by time)
            if ( data[i].date === data[i + 1].date
                    && data[i].type === "earning" && data[i + 1].type === "earning" ) {
                // Remember indices of equal IDs
                toJoin.push( i );
                toJoin.push( i + 1 );
            }
            // Join entries
            else if ( toJoin.length > 1 ) {
                allJoins.push( toJoin );
                // Reset entries to join
                toJoin = [];
            }
        }
        if ( toJoin.length > 1 ) {
            allJoins.push( toJoin );
            toJoin = [];
        }

        if ( allJoins.length > 0 ) {
            data = joinData( allJoins, data );
        }

        return data;
    }
    // File does not exist: Return undefined.
    else {
        return undefined;
    }
}

/**
 * Joins entries to one entry (just for a nicer display style, the storage remains unchanged).
 * @param {number[][]} indices The indices we want to join. Every array specifies indicies which
 * we want to join. We might have more than 1 of these arrays, so this parameter is an array of arrays.
 * @param {Object[]} data Contains the entries.
 * @return {Object[]} The data with joined entries.
 */
function joinData( indices, data ) {
    // Remove duplicates
    for ( var i = 0; i < indices.length; i++ ) {
        var elem = indices[i];
        elem = elem.filter( function(item, pos) {
            return elem.indexOf(item) == pos;
        });
        indices[i] = elem;
    }

    // Join every array of indices. We go backward, because the indices would change otherwise
    // after a join.
    for ( var i = indices.length - 1; i >= 0; i-- ) {
        var newEntry = data[indices[i][0]];
        for ( var j = 0; j < indices[i].length; j++ ) {
            if ( !newEntry.budget.toLowerCase().includes(data[indices[i][j]].budget.toLowerCase()) ) {
                newEntry.budget += ", " + data[indices[i][j]].budget;
                newEntry.amount = Math.round( (newEntry.amount + data[indices[i][j]].amount) * 1e2 ) / 1e2;
            }
        }
        data[indices[i][0]] = newEntry;
        data.splice( indices[i][0] + 1, indices[i].length - 1 );
    }

    return data;
}

/**
 * This function is for writing user data in .json files (user data means
 * either spendings or earnings; the files are named by date).
 * @param {JSON} data The data we want to write in form of a JSON object.
 */
function storeData( data ) {
    // Find out which file we want to use.
    var dateInStringFormat = dateToString( data.date );
    var dataPath = readPreference( "path" ) + path.sep
                                            + dateInStringFormat.split( "." )[1] + "."
                                            + dateInStringFormat.split( "." )[2] + ".json";
    // File exists: Write the data in it.
    if ( fs.existsSync( dataPath ) ) {
        // Get existing data, add the new data and then write it.
        // Note that content is an array, because the file contains an array
        // of JSON objects.
        var content = JSON.parse( fs.readFileSync( dataPath ) );
        content.push( data );
        // Sort the data (oldest data first).
        content = sortData( content );
        fs.writeFileSync( dataPath, JSON.stringify( content ) );
    }
    // File does not exist: Create it and write the data in it.
    else {
        // The content is an array containing JSON objects.
        fs.appendFileSync( dataPath, "[" + JSON.stringify( data ) + "]" );
    }
}

/**
 * This function is for overwriting data in a specified file.
 * @param {String} file The file we want to override.
 * @param {JSON} data The data we want to write in form of a JSON object.
 */
function replaceData( file, data ) {
    var dataPath = readPreference( "path" ) + path.sep + file;
    // File exists: Overwrite the data in it.
    if ( fs.existsSync( dataPath ) ) {
        fs.writeFileSync( dataPath, JSON.stringify( data ) );
    }
    // File does not exist: Create it and write the data in it.
    else {
        fs.appendFileSync( dataPath, JSON.stringify( data ) );
    }
}

/**
 * This function sorts data by date (oldest first) and then by name.
 * @param {JSON[]} data The data we want to sort.
 * @return {JSON[]} The sorted data.
 */
function sortData( data ) {
    return data.sort( function( obj1, obj2 ) {
        return sortFunction( obj1, obj2 );
    });
}

/**
 * Sorts objects by date and then by name.
 * @param {JSON} a The first object to compare.
 * @param {JSON} b The second object to compare.
 * @return {number} -1 in case the first object is older; 1 in case the second
 * object is older; with same dates: -1 if first object is alphabetically smaller,
 * 1 if second object is alphabetically smaller, 0 else
 */
function sortFunction( a, b ) {
    var o1 = a["date"];
    var o2 = b["date"];

    var p1 = a["name"].toLowerCase();
    var p2 = b["name"].toLowerCase();

    if (o1 < o2) return -1;
    if (o1 > o2) return 1;
    if (p1 < p2) return -1;
    if (p1 > p2) return 1;
    return 0;
}

/**
 * This function returns the name of the current file. The current file is the file
 * with the name of the current month. (We will use a new file for each month)
 * @return {String} The name of the current file.
 */
function getCurrentFileName() {
    var currentTime = new Date();
    return (currentTime.getMonth() + 1) < 10 ?
           "0" + (currentTime.getMonth() + 1).toString() +
           "." + currentTime.getFullYear().toString() + ".json" :
           (currentTime.getMonth() + 1).toString() +
           "." + currentTime.getFullYear().toString() + ".json";
}

/**
 * This function returns all JSON files in the current data directory.
 * @return {String[]} An array containing the names of all .json files.
 */
function getJSONFiles() {
    // First, get all files. Then exclude every file which is not a .json file.
    var allFiles = fs.readdirSync( readPreference( "path" ) );
    // Only add .json files to this empty array.
    var JSONFiles = [];
    // Search for files which are not .json format.
    for ( var i = 0; i < allFiles.length; i++ ) {
        // .json file found? Add it (if it is not the mainStorage file), otherwise continue without adding.
        // (Note: We only add the filename, not the extension.)
        if ( allFiles[i].endsWith( ".json" ) && allFiles[i].indexOf( "mainStorage" ) === -1 ) {
            JSONFiles.push( allFiles[i].substring( 0, allFiles[i].lastIndexOf( "." ) ) );
        }
    }
    return JSONFiles;
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
                fs.renameSync( from + path.sep + allFiles[i], to + path.sep + allFiles[i] );
            }
            // Display the error and stop trying to move files (since the destination
            // will be the same and therefore every file would produce an error).
            catch ( err ) {
                // It would be nicer if we could move files cross device but I did not figure
                // out how this can be done without getting permission errors.
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
    mainStoragePath = readPreference( "path" ) + path.sep + "mainStorage.json";
}

/**
 * This function returns a timestamp for the current date.
 * @return {number} A timestamp (in seconds) of the current date in seconds.
 */
function getCurrentDate() {
    // Divide milliseconds by 1000 to get seconds.
    return Math.floor( Date.now() / 1000 );
}

/**
 * This function converts a timestamp (in seconds) into a date in string format.
 * @param {number} timestamp The timestamp (in seconds) we want to convert.
 */
function dateToString( timestamp ) {
    // Multiply by 1000 to get milliseconds.
    var currentTime = new Date( timestamp * 1000 );
    return (currentTime.getDate() < 10 ?
                "0" + currentTime.getDate().toString() :
                currentTime.getDate().toString()) + "." +
           ((currentTime.getMonth() + 1) < 10 ?
                "0" + (currentTime.getMonth() + 1).toString() :
                (currentTime.getMonth() + 1).toString()) + "." +
           currentTime.getFullYear().toString();
}

/**
 * Makes sure that a given timestamp is not already used. If it is, we add one second to it.
 * @param {number} date The date as a timestamp.
 * @return {number} A unique timestamp for the date.
 */
function uniqueDate( date ) {
    var dateInStringFormat = dateToString( date );
    var correspondingFile  = readPreference( "path" ) + path.sep
                           + dateInStringFormat.split( "." )[1] + "."
                           + dateInStringFormat.split( "." )[2] + ".json";
    var content = readJSONFile( correspondingFile );

    // one for-loop is enough because the file is sorted by date. So if we add one, we can detect
    // duplicates again.
    for ( var i = 0; i < content.length; i++ ) {
        if ( content[i].date === date ) {
            date = date + 1;
        }
    }
    return date;
}

/**
 * Returns texts in the correct language.
 * @param {String} filename The name of the file containing the text.
 * @return {JSON} The corresponding data in JSON format.
 */
function readJSONFile( filename ) {
    return JSON.parse( fs.readFileSync( filename ) );
}

/**
 * Writes data to PDF files.
 * @param {String} pdfPath Directory in which the PDF should be saved.
 * @param {Object} data The data we want to print to PDF.
 */
function writePDF( pdfPath, data ) {
    pdfPath = pdfPath[0] + path.sep + dateToString( getCurrentDate() ) + ".pdf";
    fs.writeFileSync( pdfPath, data );
}
