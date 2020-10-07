/**
 * Deletes a given entry.
 * @param {String} entry The id (timestamp) of the entry we want to delete.
 */
function deleteEntry( entry ) {
    createDialog( textElements.reallyDeleteEntryTitle, textElements.reallyDeleteEntry, function() {
		let DateHandler = require('../scripts/utils/dateHandler.js');
		var dateAsString = DateHandler.timestampToString( entry );
        var file = dateAsString.split(".")[1] + "." +
                   dateAsString.split(".")[2] + ".json";

        deleteData( file, entry );
        updateView();
        $( this ).dialog( "close" );
    });
}
