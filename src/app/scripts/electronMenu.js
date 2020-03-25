/**
 * This file creates our application menu in the correct language.
 *
 * @module electronMenu
 * @author Malte311
 */

// We use this to find out, which language is selected.
const JSONhandler = require( './JSONhandler.js' );
// Systemconfiguration file (e.g. for devMode).
const config = require( './config.js' );

// This array will contain the menu at the end (we will push all the information to it).
var menuTemplate = [];

// Set all labels in dependency of the currently selected language.
var editLabels, windowLabels;

var currentLanguage = JSONhandler.readPreference( "language" );
switch ( currentLanguage ) {
    case "en":
        editLabels = ["Edit", "Undo", "Redo", "Cut", "Copy", "Paste"];
        windowLabels = ["Window", "Reload", "Minimize", "Close", "Exit"];
        break;
    case "de":
        editLabels = ["Bearbeiten", "Rückgängig", "Wiederholen", "Ausschneiden", "Kopieren", "Einfügen"];
        windowLabels = ["Fenster", "Neu laden", "Minimieren", "Schließen", "Beenden"];
        break;
}

// Now, add everything to our template.
menuTemplate.push({
    label: editLabels[0],
    submenu: [
        {
            label: editLabels[1],
            role: 'undo'
        },
        {
            label: editLabels[2],
            role: 'redo'
        },
        { type: 'separator' },
        {
            label: editLabels[3],
            role: 'cut'
        },
        {
            label: editLabels[4],
            role: 'copy'
        },
        {
            label: editLabels[5],
            role: 'paste'
        }
    ]
});

menuTemplate.push({
    label: windowLabels[0],
    submenu: [
        {
            label: windowLabels[1],
            role: 'reload'
        },
        { type: 'separator' },
        {
            label: windowLabels[2],
            role: 'minimize'
        },
        {
            label: windowLabels[3],
            role: 'close'
        },
        {
            label: windowLabels[4],
            role: 'quit'
        }
    ]
});

// devtools?
if ( config.devMode ) {
    menuTemplate.push({
        label: 'Developer',
        submenu: [
            { role: 'forcereload' },
            { role: 'toggledevtools' }
        ]
    });
}

// Export the module, so we can use it in our main.js file to create an application menu.
module.exports = menuTemplate;
