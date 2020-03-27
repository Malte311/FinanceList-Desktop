const isRunningInAsar = require('electron-is-running-in-asar');

module.exports = {
	devMode: !isRunningInAsar(),
	log: false
}