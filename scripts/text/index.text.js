/**************************************************************************************************
 * This file contains all the text elements for the overview page.
 * Note: default cases are not needed because getLanguage() will always return a valid string.
**************************************************************************************************/

/**
 * This function returns text for the recent earnings/spendings section in case there are no recent earnings/spendings.
 * @param {String} type The type of the transaction (earning/spending).
 * @return {String} The text for the recent earnings/spendings section in case there are no recent earnings/spendings.
 */
function getRecentTransactionsMissingDataMessage( type ) {
    switch ( getLanguage() ) {
        case "en":
            return (type === "spending" ? "There are no recent spendings yet!" : "There are no recent earnings yet!");
        case "de":
            return (type === "spending" ? "Es gibt bisher keine Ausgaben!" : "Es gibt bisher keine Einnahmen!");
    }
}

/**
 * This function returns text for the all time earnings/spendings section in case there are no earnings/spendings.
 * @param {String} type The type of the transaction (earning/spending).
 * @return {String} The text for all time earnings/spendings section in case there are no earnings/spendings.
 */
function getAllTimeTransactionsMissingDataMessage( type ) {
    switch ( getLanguage() ) {
        case "en":
            return (type === "spending" ? "There are no spendings yet!" : "There are no earnings yet!");
        case "de":
            return (type === "spending" ? "Es gibt bisher keine Ausgaben!" : "Es gibt bisher keine Einnahmen!");
    }
}

/**
 * This function returns text for recent earnings/spendings heading in the correct language.
 * @param {String} type The type of the transaction (earning/spending).
 * @return {String} The heading for the recent earnings/spendings section.
 */
function getRecentTransactionsHeading( type ) {
    switch ( getLanguage() ) {
        case "en":
            return (type === "spending" ? "Recent spendings" : "Recent earnings");
        case "de":
            return (type === "spending" ? "K&uuml;rzliche Ausgaben" : "K&uuml;rzliche Einnahmen");
    }
}

/**
 * This function returns text for all time spendings/earnings in the correct language.
 * @param {String} type The type of the transaction (earning/spending).
 * @return {String} The text for the all time spendings/earnings section.
 */
function getAllTimeTransactionsText( type ) {
    switch ( getLanguage() ) {
        case "en":
            return (type === "spending" ? "All time spendings" : "All time earnings");
        case "de":
            return (type === "spending" ? "Gesamtausgaben" : "Gesamteinnahmen");
    }
}
