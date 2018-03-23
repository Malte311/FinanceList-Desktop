/**
 * This function initializes the page when its loaded. This means it sets the
 * language and some of the content.
 */
function loadPage() {
    // We will always set the language first.
    setLanguage( readPreference( "language" ) );
    // Display all the other content.
    updateView();
}
