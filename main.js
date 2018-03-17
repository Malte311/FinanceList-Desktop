const electron = require( 'electron' );
// Systemconfiguration file.
const config = require( './scripts/config.js' );
// Module to read the settings.json file.
const JSONhandler = require( './scripts/JSONhandler.js' );

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

function createWindow () {
    var windowSize = JSONhandler.getPreference( "windowSize" );
    var fullscreen = JSONhandler.getPreference( "fullscreen" );
    // Create the browser window
    mainWindow = new electron.BrowserWindow({
        width: parseInt( windowSize.split( "x" )[0] ),
        height: parseInt( windowSize.split( "x" )[1] ),
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

    // load menu
    electron.Menu.setApplicationMenu(
		electron.Menu.buildFromTemplate(
			require('./scripts/electronMenu.js')
		)
	);
    // Open the devtools.
    if ( config.devMode ) mainWindow.webContents.openDevTools();
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
        app.quit()
    }
});

electron.app.on( 'activate', function () {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if ( mainWindow === null ) {
        createWindow()
    }
});
