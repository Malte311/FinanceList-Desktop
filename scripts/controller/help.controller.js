/**************************************************************************************************
 * This file controls all actions on the help page.
**************************************************************************************************/

/**
 * This function initializes the page when its loaded. This means it sets the
 * language and the dynamic content.
 */
function loadPage() {
    // Set the correct language.
    setLanguage( readPreference( "language" ) );
}
