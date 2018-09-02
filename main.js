/**
 * This file is the entry point of our app. It creates the window and loads the index.html file.
 */

const electron = require( 'electron' );
// Configuration file.
const config = require( './scripts/config.js' );
// Module to read the settings.json file (we need this to get the window size
// and to initialize the storage, which means create missing paths and files).
const JSONhandler = require( './scripts/JSONhandler.js' );

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

/**
 * Creates the application window.
 */
function createWindow () {
    // Read the stored data to select the window size and window mode.
    var screenWidth, screenHeight, fullscreen;
    try {
        // Note: If there are no numbers found to be parsed, this fails and
        // we will set default values. If the numbers are nonsense, the window
        // will still appear (numbers too big won't matter and negative numbers
        // won't matter as well). That's why we don't do further checking on the numbers.
        screenWidth = parseInt( JSONhandler.readPreference( "windowSize" ).split( "x" )[0] );
        screenHeight = parseInt( JSONhandler.readPreference( "windowSize" ).split( "x" )[1] );
        fullscreen = JSONhandler.readPreference( "fullscreen" );
    }
    // In case the file is corrupted, we set some default values.
    catch ( err ) {
        // Note: As stated above, even if the monitor is less than these values,
        // the window will still appear (the window will be as big as possible).
        screenWidth = 1920;
        screenHeight = 1080;
    }
    // We want make sure, fullscreen is a boolean type value. Otherwise
    // we might get into trouble when setting the "fullscreen" option of our mainWindow.
    if ( fullscreen !== true && fullscreen !== false ) fullscreen = false;
    // Create the browser window
    mainWindow = new electron.BrowserWindow({
        width: screenWidth,
        height: screenHeight,
        icon: __dirname + '/img/tab.ico',
        movable: true,
        center: true,
        fullscreen: fullscreen,
        show: false
    });

    // and load the index.html of the app.
    mainWindow.loadURL('file://' + __dirname + '/index.html' );

    // Don't show the window before content finished loading
    mainWindow.once( 'page-title-updated', function() {
        mainWindow.show();
    });

    // Emitted when the window is closed.
    mainWindow.on( 'closed', function () {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        mainWindow = null
    });

    // load menu in the correct language. Unfortunately, the menu won't update
    // immediately when the language is changed at runtime. It will be set once at
    // the start of the application and does not change until a restart happens.
    electron.Menu.setApplicationMenu(
		electron.Menu.buildFromTemplate(
			require('./scripts/electronMenu.js')
		)
	);
    // Open the devtools?
    if ( config.devMode ) mainWindow.webContents.openDevTools();
    // Init the JSON storage (create missing paths and files to avoid errors).
    JSONhandler.initStorage();
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
electron.app.on( 'ready', createWindow );

// Quit when all windows are closed.
electron.app.on( 'window-all-closed', function () {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if ( process.platform !== 'darwin' ) {
        electron.app.quit()
    }
});

electron.app.on( 'activate', function () {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if ( mainWindow === null ) {
        createWindow()
    }
});
