/**
 * This file is for handling the storage (.json files).
 * It does everything related to files and directories.
 *
 * @module JSONhandler
 * @author Malte311
 */

// Node FileSystem to read and write in .json files.
const fs = require( 'fs' );

// We use this module to get the correct path seperator (only needed to display it correctly).
const path = require( 'path' );

// This is for reading the settings.json file in the main process.
module.exports.readPreference = ( name ) => readPreference( name );
module.exports.storePreference = ( name, value ) => storePreference( name, value );

/**
 * This function returns all JSON files in the current data directory.
 * @return {String[]} An array containing the names of all .json files.
 */
function getJSONFiles() {
    // First, get all files. Then exclude every file which is not a .json file.
    var allFiles = fs.readdirSync( readPreference( "path" ) );
    allFiles.sort( (a, b) => {
        var aSplit = a.split( "." );
        var bSplit = b.split( "." );
        if (aSplit[1] < bSplit[1]) return -1;
        if (aSplit[1] > bSplit[1]) return 1;
        if (aSplit[0] < bSplit[0]) return -1;
        if (aSplit[0] > bSplit[0]) return 1;
        return 0;
    });
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
                fs.renameSync( from + Path.sep() + allFiles[i], to + Path.sep() + allFiles[i] );
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
 * Writes data to PDF files.
 * @param {String} pdfPath Directory in which the PDF should be saved.
 * @param {Object} data The data we want to print to PDF.
 */
function writePDF( pdfPath, data ) {
    pdfPath = pdfPath[0] + Path.sep() + (selectedMonth != null ? selectedMonth : selectedYear) + ".pdf";
    fs.writeFileSync( pdfPath, data );
}