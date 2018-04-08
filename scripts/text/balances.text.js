/**************************************************************************************************
 * This file contains all the text elements for the balances page.
 * Note: default cases are not needed because getLanguage() will always return a valid string.
**************************************************************************************************/

/**
 * This function returns text for the "Confirm" button in the correct language.
 * @return {String} The text for the "Confirm" button in every dialog.
 */
function getConfirmButtonText() {
    switch ( getLanguage() ) {
        case "en":
            return "Confirm";
        case "de":
            // This is no HTML, not sure how to handle the umlaut.
            return "Bestätigen";
    }
}

/**
 * This function returns text for the "Cancel" button in the correct language.
 * @return {String} The text for the "Cancel" button in every dialog.
 */
function getCancelButtonText() {
    switch ( getLanguage() ) {
        case "en":
            return "Cancel";
        case "de":
            return "Abbrechen";
    }
}

/**
 * This function returns text for current budgets headings in the correct language.
 * @return {String[]} The headings for the current budgets section.
 */
function getCurrentBudgetsHeadings() {
    switch ( getLanguage() ) {
        case "en":
            return ["Budget", "Balance", "Rename/Delete", "Allocation ratio"];
        case "de":
            return ["Konto", "Kontostand", "Umbenennen/L&ouml;schen", "Anteil bei Aufteilung"];
    }
}

/**
 * This function returns text for recurring transactions headings in the correct language.
 * @return {String[]} The headings for the recurring transactions section.
 */
function getRecurringTransactionsHeadings() {
    switch ( getLanguage() ) {
        case "en":
            return ["Name", "Amount", "Type", "Budget", "Category", "Next execution", "Delete"];
        case "de":
            return ["Name", "Summe", "Art", "Konto", "Kategorie", "N&auml;chste Ausf&uuml;hrung", "L&ouml;schen"];
    }
}

/**
 * This function returns text for recurring transactions content in the correct language.
 * @return {String[]} The content for the recurring transactions section.
 */
function getRecurringTransactionsContent() {
    switch ( getLanguage() ) {
        case "en":
            return ["earning", "spending", "days", "No recurring transactions available."];
        case "de":
            return ["Einnahme", "Ausgabe", "Tage", "Es sind keine wiederkehrenden Transaktionen vorhanden."];
    }
}

/**
 * This function returns the title of the transaction dialog in the correct language.
 * @return {String} The title of the transaction dialog.
 */
function getTransactionDialogTitle() {
    switch ( getLanguage() ) {
        case "en":
            return "Add transaction";
        case "de":
            // This is no HTML, not sure how to handle the umlaut.
            return "Eintrag hinzufügen";
    }
}

/**
 * This function returns the text elements of the transaction dialog in the correct language.
 * @return {String[]} The text elements of the transaction dialog.
 */
function getTransactionDialogTextElements() {
    switch ( getLanguage() ) {
        case "en":
            return ["Here you can add new earnings or new spendings.", "Earning", "Spending", "Name", "Amount", "Category", "(optionally)", "Choose budget", "Allocate automatically", "Budget", "Automate"];
        case "de":
            return ["Hier k&ouml;nnen Sie neue Einnahmen oder Ausgaben hinzuf&uuml;gen.", "Einnahme", "Ausgabe", "Name", "Betrag", "Kategorie", "(optional)", "Konto w&auml;hlen", "Automatisch verteilen", "Konto", "Automatisieren"];
    }
}

/**
 * This function returns the text elements of the interval options in the correct language.
 * @return {String[]} The text elements of the interval options.
 */
function getIntervalOptionsTextElements() {
    switch ( getLanguage() ) {
        case "en":
            return ["monthly", "bimonthly", "quarterly", "biannual", "annual"];
        case "de":
            return ["monatlich", "zweimonatlich", "viertelj&auml;hrlich", "halbj&auml;hrlich", "j&auml;hrlich"];
    }
}

/**
 * This function returns the title of the add budget dialog in the correct language.
 * @return {String} The title of the add budget dialog.
 */
function getAddBudgetDialogTitle() {
    switch ( getLanguage() ) {
        case "en":
            return "Add budget";
        case "de":
            // This is no HTML, not sure how to handle the umlaut.
            return "Konto hinzufügen";
    }
}

/**
 * This function returns the text of the add budget dialog in the correct language.
 * @return {String} The text of the add budget dialog.
 */
function getAddBudgetDialogText() {
    switch ( getLanguage() ) {
        case "en":
            return "Type in the name of the new budget.";
        case "de":
            return "Geben Sie einen Namen f&uuml;r das neue Konto ein.";
    }
}

/**
 * This function returns the title of the delete budget dialog in the correct language.
 * @return {String} The title of the delete budget dialog.
 */
function getDeleteBudgetDialogTitle() {
    switch ( getLanguage() ) {
        case "en":
            return "Delete budget";
        case "de":
            // This is no HTML, not sure how to handle the umlaut.
            return "Konto löschen";
    }
}

/**
 * This function returns the text of the delete budget dialog in the correct language.
 * @return {String} The text of the delete budget dialog.
 */
function getDeleteBudgetDialogText() {
    switch ( getLanguage() ) {
        case "en":
            return "Are you sure you want to delete this budget? <br> All the data will be lost.";
        case "de":
            return "Wollen Sie dieses Konto wirklich l&ouml;schen? <br> Dann gehen alle gespeicherten Daten verloren.";
    }
}

/**
 * This function returns the title of the rename budget dialog in the correct language.
 * @return {String} The title of the rename budget dialog.
 */
function getRenameBudgetDialogTitle() {
    switch ( getLanguage() ) {
        case "en":
            return "Rename budget";
        case "de":
            return "Konto umbenennen";
    }
}

/**
 * This function returns the text of the rename budget dialog in the correct language.
 * @return {String} The text of the rename budget dialog.
 */
function getRenameBudgetDialogText() {
    switch ( getLanguage() ) {
        case "en":
            return "Type in a new name for this budget.";
        case "de":
            return "Geben Sie einen neuen Namen f&uuml;r dieses Konto ein.";
    }
}

/**
 * This function returns the title of the set allocation dialog in the correct language.
 * @return {String} The title of the set allocation dialog.
 */
function getSetAllocationDialogTitle() {
    switch ( getLanguage() ) {
        case "en":
            return "Automated allocation";
        case "de":
            return "Automatische Aufteilung";
    }
}

/**
 * This function returns the text elements of the set allocation dialog in the correct language.
 * @return {String[]} The text elements of the set allocation dialog.
 */
function getSetAllocationDialogTextElements() {
    switch ( getLanguage() ) {
        case "en":
            return ["Here you can select how your earnings should be distributed.", "Activate automated allocation", "Distribute all earnings automatically to your budgets.", "Budget", "Percentage"];
        case "de":
            return ["Hier k&ouml;nnen Sie ausw&auml;hlen, wie Ihre Einnahmen verteilt werden sollen.", "Automatische Verteilung aktivieren", "Verteilt alle Einnahmen automatisch auf mehrere Konten.", "Konto", "Anteil"];
    }
}
