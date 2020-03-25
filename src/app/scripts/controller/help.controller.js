/**
 * This file controls all actions on the help page.
 *
 * @module helpController
 * @author Malte311
 */

/**
 * This function initializes the page when its loaded. This means it sets the
 * language and the dynamic content.
 */
function loadPage() {
    // Set the correct language.
    setLanguage( readPreference( "language" ) );
}
