/**
 * This file is holding the applications configuration.
 *
 * @author Malte311
 */

const isRunningInAsar = require( 'electron-is-running-in-asar' );

module.exports = {
    // Devtools on?
	devMode : !isRunningInAsar(),
	log : false,
	updateNeeded : false
}
