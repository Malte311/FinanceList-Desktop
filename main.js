const electron = require( 'electron' );
// Module to control application life.
const app = electron.app;
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow;
// Module to create custom menu
const Menu = electron.Menu;
const path = require( 'path' );
const url = require( 'url' );
// Module for accessing JSON storage
const storage = require( 'electron-json-storage' );
// If set true, this will enable developer tools
const devMode = true;

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

function createWindow () {
    // Create the browser window (with default values)
    mainWindow = new BrowserWindow({
        width: 1920,
        height: 1080,
        icon: path.join( __dirname, 'img/tab.ico' ),
        movable: true,
        center: true,
        fullscreen: false,
        show: false
    });

    // and load the index.html of the app.
    mainWindow.loadURL( url.format({
        pathname: path.join( __dirname, 'index.html' ),
        protocol: 'file:',
        slashes: true
    }));

    // Read the configuration file, to get the preferences.
    storage.get( "settings", function( error, data ) {
        if ( error ) throw error;
        // try-catch to ensure that the input is O.K.
        try {
            mainWindow.setSize( parseInt( data.windowSize.split( "x" )[0] ),
                                parseInt( data.windowSize.split( "x" )[1] ));
        }
        // Set default value since the input was not O.K.
        catch ( err ) {
            var settingsObj = data;
            settingsObj.windowSize = "1920x1080";
            storage.set( "settings", settingsObj, function( error ) {
                if ( error ) throw error;
            });
        }
        // Set default value in case no correct value exists.
        if ( data.fullscreen !== true && data.fullscreen !== false ) {
            var settingsObj = data;
            settingsObj.fullscreen = false;
            storage.set( "settings", settingsObj, function( error ) {
                if ( error ) throw error;
            });
        }
        mainWindow.setFullScreen( data.fullscreen );
        mainWindow.center();
    });

    // Don't show the window before content finished loading
    mainWindow.once( 'page-title-updated', function() {
        mainWindow.show();
    });

    // Open the DevTools.
    // mainWindow.webContents.openDevTools()

    // Emitted when the window is closed.
    mainWindow.on( 'closed', function () {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        mainWindow = null
    });

    // Create menu
    var menuTemplate = [];
    menuTemplate.push({
        label: "Edit",
        submenu: [
            {
                label: 'Undo',
                role: 'undo'
            },
            {
                label: 'Redo',
                role: 'redo'
            },
            { type: 'separator' },
            {
                label: 'Cut',
                role: 'cut'
            },
            {
                label: 'Copy',
                role: 'copy'
            },
            {
                label: 'Paste',
                role: 'paste'
            }
        ]
    });
    menuTemplate.push({
        label: 'Window',
        submenu: [
            {
                label: 'Reload',
                role: 'reload'
            },
            { type: 'separator' },
            {
                label: 'Minimize',
                role: 'minimize'
            },
            {
                label: 'Close',
                role: 'close'
            },
            // Quit for Mac users (CMD+Q).
            {
                label: 'Quit',
				role: 'quit'
            }
        ]
    });

    // devtools
    if ( devMode ) {
        menuTemplate.push({
            label: 'Developer',
            submenu: [
                { role: 'forcereload' },
                { role: 'toggledevtools' }
            ]
        });
        // open console automatically when in devmode
        mainWindow.webContents.openDevTools();
    }

    // load menu
    const menu = Menu.buildFromTemplate( menuTemplate );
    Menu.setApplicationMenu( menu );
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on( 'ready', createWindow );

// Quit when all windows are closed.
app.on( 'window-all-closed', function () {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if ( process.platform !== 'darwin' ) {
        app.quit()
    }
});

app.on( 'activate', function () {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if ( mainWindow === null ) {
        createWindow()
    }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
