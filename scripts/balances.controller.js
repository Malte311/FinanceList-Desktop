/**
 * This function initializes the page when its loaded. This means it sets the
 * language and some of the content.
 */
function loadPage() {
    setLanguage();

    addSpending( "auto", "porsche" );
}

/**
 * This function saves new spending entries in json files.
 * @param {String} spending The name of the spending.
 * @param {String} category The name of the category of the spending. It is
 * possible to select more than one category (seperated by commas).
 */
function addSpending( spending, category ) {
    // First, we get the current time to add this data to the entry.
    var currentTime = new Date();
    var day = currentTime.getDate() < 10 ? "0" + currentTime.getDate().toString() : currentTime.getDate().toString();
    var month = (currentTime.getMonth() + 1) < 10 ? "0" + (currentTime.getMonth() + 1).toString() : (currentTime.getMonth() + 1).toString();
    var fileName = month + "." + currentTime.getFullYear().toString();
    var timestamp = day + "." + fileName;
    // Before we store the data, we get the path to the file in which we want to store it.
    storage.get( "settings", function( error, data ) {
        if ( error ) throw error;
        // If no path exists, we set a default path.
        if ( data.path === undefined || data.path === null ) {
            // Save existing data and add a value for "path".
            var settingsObj = data;
            settingsObj.path = __dirname + "/data";
            storage.set( "settings", settingsObj, function( error ) {
                if ( error ) throw error;
            });
        }



    });


}
