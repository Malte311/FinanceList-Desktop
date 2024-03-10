const electron = require('electron');
const config = require(__dirname + '/scripts/electron/config.js');
const JsonStorage = require(__dirname + '/scripts/storage/jsonStorage.js');

let jsStorage = new JsonStorage();

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

/**
 * Creates the application window.
 */
function createWindow() {
	// Read the stored data to select the window size and window mode.
	let screenWidth, screenHeight, fullscreen;
	let mainScreenWidth = electron.screen.getPrimaryDisplay().size.width;
	let mainScreenHeight = electron.screen.getPrimaryDisplay().size.height;
	
	try {
		screenWidth = parseInt(jsStorage.readPreference('windowSize').split('x')[0]);
		screenHeight = parseInt(jsStorage.readPreference('windowSize').split('x')[1]);
		fullscreen = JSON.parse(jsStorage.readPreference('fullscreen'));
	}
	catch (err) { // If the file is corrupted, we set default values (size of the main screen).
		screenWidth = mainScreenWidth;
		screenHeight = mainScreenHeight;
	}

	mainWindow = new electron.BrowserWindow({
		width: screenWidth,
		height: screenHeight,
		icon: electron.nativeImage.createFromPath(__dirname + '/img/tab.ico'),
		movable: true,
		center: true,
		fullscreen: typeof fullscreen === 'boolean' ? fullscreen : false,
		show: false,
		webPreferences: {
			contextIsolation: false,
			nodeIntegration: true
		}
	});

	if (screenWidth >= mainScreenWidth && screenHeight >= mainScreenHeight) {
		mainWindow.maximize(); // Maximize window if it is at least as big as the screen size.
	}

	mainWindow.loadURL('file://' + __dirname + '/templates/index.html');

	mainWindow.once('page-title-updated', function() {
		mainWindow.show();
	});

	mainWindow.on('closed', function() {
		mainWindow = null;
	});

	mainWindow.on('close', function() {
		if (!mainWindow.isMaximized()) {
			let size = mainWindow.getSize();
			jsStorage.storePreference('windowSize', `${size[0]}x${size[1]}`);
		}
	});

	mainWindow.on('maximize', function() {
		jsStorage.storePreference('windowSize', `${mainScreenWidth}x${mainScreenHeight}`);
	});

	let electronMenu = require(__dirname + '/scripts/electron/electronMenu.js');
	electron.Menu.setApplicationMenu(electron.Menu.buildFromTemplate(electronMenu));

	if (config.devMode) mainWindow.webContents.openDevTools();
}

electron.app.on('ready', createWindow);

electron.app.on('window-all-closed', function() {
	// On OS X it is common for applications and their menu bar
	// to stay active until the user quits explicitly with Cmd + Q.
	if (process.platform !== 'darwin') {
		electron.app.quit();
	}
});

electron.app.on('activate', function() {
	// On OS X it's common to re-create a window in the app when the
	// dock icon is clicked and there are no other windows open.
	if (mainWindow === null) {
		createWindow();
	}
});

electron.ipcMain.on('showMessageBox', (event, arg) => {
	electron.dialog.showMessageBox(arg).then(res => event.reply('showMessageBoxThen', res));
});

electron.ipcMain.on('showOpenDialog', (event, arg) => {
	electron.dialog.showOpenDialog(arg).then(res => event.reply('showOpenDialogThen', res));
});

electron.ipcMain.on('getVersion', event => {
	event.returnValue = electron.app.getVersion();
});