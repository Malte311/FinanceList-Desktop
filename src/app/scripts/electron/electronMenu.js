const JsonStorage = require(__dirname + '/../storage/jsonStorage.js');
const config = require(__dirname + '/config.js');

// Set all labels in dependency of the currently selected language.
let lang = (new JsonStorage()).readPreference('language');
let textData = require(`${__dirname}/../../text/text_${lang}.json`);

// This array will contain the menu at the end (we will push all the information to it).
let menuTemplate = [];

menuTemplate.push({
    label: textData['edit'],
    submenu: [
        {
            label: textData['undo'],
            role: 'undo'
        },
        {
            label: textData['redo'],
            role: 'redo'
        },
        { type: 'separator' },
        {
            label: textData['cut'],
            role: 'cut'
        },
        {
            label: textData['copy'],
            role: 'copy'
        },
        {
            label: textData['paste'],
            role: 'paste'
        }
    ]
});

menuTemplate.push({
    label: textData['window'],
    submenu: [
        {
            label: textData['reload'],
            role: 'reload'
        },
        { type: 'separator' },
        {
            label: textData['minimize'],
            role: 'minimize'
        },
        {
            label: textData['close'],
            role: 'close'
        },
        {
            label: textData['exit'],
            role: 'quit'
        }
    ]
});

if (config.devMode) {
    menuTemplate.push({
        label: 'Developer',
        submenu: [
            { role: 'forcereload' },
            { role: 'toggledevtools' }
        ]
    });
}

module.exports = menuTemplate;