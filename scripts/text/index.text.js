/**************************************************************************************************
 * This file contains all the text elements for the overview page.
**************************************************************************************************/

/**
 * This function returns text for the recent spendings section in case there are no recent spendings.
 * @return {String} The text for the recent spendings section in case there are no recent spendings.
 */
function getRecentSpendingsMissingDataMessage() {
    switch ( getLanguage() ) {
        case "en":
            return "There are no recent spendings yet!";
        case "de":
            return "Es gibt bisher keine Ausgaben!";
    }
}

/**
 * This function returns text for the recent earnings section in case there are no recent earnings.
 * @return {String} The text for the recent earnings section in case there are no recent earnings.
 */
function getRecentEarningsMissingDataMessage() {
    switch ( getLanguage() ) {
        case "en":
            return "There are no recent earnings yet!";
        case "de":
            return "Es gibt bisher keine Einnahmen!";
    }
}

/**
 * This function returns text for the all time spendings section in case there are no spendings.
 * @return {String} The text for all time spendings section in case there are no spendings.
 */
function getAllTimeSpendingsMissingDataMessage() {
    switch ( getLanguage() ) {
        case "en":
            return "There are no spendings yet!";
        case "de":
            return "Es gibt bisher keine Ausgaben!";
    }
}

/**
 * This function returns text for the all time earnings section in case there are no earnings.
 * @return {String} The text for all time earnings section in case there are no earnings.
 */
function getAllTimeEarningsMissingDataMessage() {
    switch ( getLanguage() ) {
        case "en":
            return "There are no earnings yet!";
        case "de":
            return "Es gibt bisher keine Einnahmen!";
    }
}

/**
 * This function returns text for recent spendings heading in the correct language.
 * @return {String} The heading for the recent spendings section.
 */
function getRecentSpendingsHeading() {
    switch ( getLanguage() ) {
        case "en":
            return "Recent spendings";
        case "de":
            return "K&uuml;rzliche Ausgaben";
    }
}

/**
 * This function returns text for recent earnings heading in the correct language.
 * @return {String} The heading for the recent earnings section.
 */
function getRecentEarningsHeading() {
    switch ( getLanguage() ) {
        case "en":
            return "Recent earnings";
        case "de":
            return "K&uuml;rzliche Einnahmen";
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
        default:
            return (type === "spending" ? "All time spendings" : "All time earnings");
    }
}
