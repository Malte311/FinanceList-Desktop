// We use this to find out, which language is selected.
const JSONhandler = require( './JSONhandler.js' );
// Systemconfiguration file (e.g. for devMode).
const config = require( './config.js' );

var menuTemplate = [];

// Set all labels in dependency of the currently selected language.
var editLabels, windowLabels;

var currentLanguage = JSONhandler.getPreference( "language" );
switch ( currentLanguage ) {
    case "en":
        editLabels = ["Edit", "Undo", "Redo", "Cut", "Copy", "Paste"];
        windowLabels = ["Window", "Reload", "Minimize", "Close"];
        break;
    case "de":
        editLabels = ["Bearbeiten", "Rückgängig", "Wiederholen", "Ausschneiden", "Kopieren", "Einfügen"];
        windowLabels = ["Fenster", "Neu laden", "Minimieren", "Schließen"];
        break;
}

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
    ]
});

// devtools
if ( config.devMode ) {
    menuTemplate.push({
        label: 'Developer',
        submenu: [
            { role: 'forcereload' },
            { role: 'toggledevtools' },
            { role: 'quit' }
        ]
    });
}

// Export the module.
module.exports = menuTemplate;
