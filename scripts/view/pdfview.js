/**
 * This file creates a PDF view.
 *
 * @author Malte311
 */

/**
 * Initializes the PDF view page.
 */
function initPdfView() {

}

/**
 * Monthly overview for PDF export.
 */
function printToPDF() {
    var pdfPath = dialog.showOpenDialog({
        properties: ['openDirectory']
    });

    if ( pdfPath !== null && pdfPath !== undefined ) {
        win.webContents.printToPDF( {}, function( error, data ) {
            if ( error ) {
                console.log( error );
            }
            else {
                writePDF( pdfPath, data );
            }
        });
    }
}
