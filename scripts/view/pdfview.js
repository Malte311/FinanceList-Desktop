/**
 * This file creates a PDF view.
 *
 * @author Malte311
 */

/**
 * Initializes the PDF view page.
 * @param {String} month Month for which the overview should be created.
 */
function initPdfView( month ) {
    window.location.href='pdfview.html';
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
