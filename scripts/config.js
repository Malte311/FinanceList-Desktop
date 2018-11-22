/**
 * This file is holding the applications configuration.
 *
 * @author Malte311
 */

const isDev = require( 'electron-is-dev' );

module.exports = {
    // Devtools on?
	devMode : isDev,
	log : false,
	updateNeeded : false
}
