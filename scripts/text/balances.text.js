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
            return "Best\u00e4tigen";
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
            return ["Name", "Amount", "Type", "Budget", "Category", "Next execution", "Interval", "End date", "Delete"];
        case "de":
            return ["Name", "Summe", "Art", "Konto", "Kategorie", "N&auml;chste Ausf&uuml;hrung", "Intervall", "Enddatum", "L&ouml;schen"];
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
            return "Eintrag hinzuf\u00fcgen";
    }
}

/**
 * This function returns the text elements of the transaction dialog in the correct language.
 * @return {String[]} The text elements of the transaction dialog.
 */
function getTransactionDialogTextElements() {
    switch ( getLanguage() ) {
        case "en":
            return ["Here you can add new earnings or new spendings.", "Earning", "Spending", "Name", "Amount", "Category", "(optionally)", "Date", "Choose budget", "Allocate automatically", "Budget", "Automate", "End date", "never"];
        case "de":
            return ["Hier k&ouml;nnen Sie neue Einnahmen oder Ausgaben hinzuf&uuml;gen.", "Einnahme", "Ausgabe", "Name", "Betrag", "Kategorie", "(optional)", "Datum", "Konto w&auml;hlen", "Automatisch verteilen", "Konto", "Automatisieren", "Enddatum", "nie"];
    }
}

/**
 * This function returns the text elements of the interval options in the correct language.
 * Note: THe elements need to be in this order. Changing the order will result in unwanted behaviour.
 * @return {String[]} The text elements of the interval options.
 */
function getIntervalOptionsTextElements() {
    switch ( getLanguage() ) {
        case "en":
            return ["weekly", "every 4 weeks", "monthly", "bimonthly", "quarterly", "biannual", "annual"];
        case "de":
            return ["w&ouml;chentlich", "alle 4 Wochen", "monatlich", "zweimonatlich", "viertelj&auml;hrlich", "halbj&auml;hrlich", "j&auml;hrlich"];
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
            return "Konto hinzuf\u00fcgen";
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
            return "Konto l\u00f6schen";
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

/**
 * This function returns the text for the display type (table/graph).
 * @return {String[]} The text for the display type (table/graph).
 */
function getDisplayTypeTextElements() {
    switch ( getLanguage() ) {
        case "en":
            return ["Graph", "Table"];
        case "de":
            return ["Graph", "Tabelle"];
    }
}

/**
 * This function returns the headings for the detail overview table.
 * @return {String[]} The headings for the detail overview table.
 */
function getMainContentTableHeadings() {
    switch ( getLanguage() ) {
        case "en":
            return ["Date", "Name", "Amount", "Category", "Budget", "Type"];
        case "de":
            return ["Datum", "Name", "Summe", "Kategorie", "Konto", "Art"];
    }
}

/**
 * This function returns the text for the filters in the main content.
 * @return {String[]} The text for the filters in the main content.
 */
function getMainContentFilterText() {
    switch ( getLanguage() ) {
        case "en":
            return ["All budgets", "All types", "Earnings", "Spendings", "All time", "to", "All transactions", "All categories"];
        case "de":
            return ["Alle Konten", "Alle Arten", "Einnahmen", "Ausgaben", "Gesamter Zeitraum", "bis", "Alle Transaktionen", "Alle Kategorien"];
    }
}

/**
 * This function returns the text for the start button in the main content.
 * @return {String[]} The text for the start button in the main content.
 */
function getMainContentStartButtonText() {
    switch ( getLanguage() ) {
        case "en":
            return "Update";
        case "de":
            return "Aktualisieren";
    }
}

/**
 * This function returns the type in the correct language (it "translates" the type).
 * @param {String} type The type (in English).
 * @return {String} The type in the currently selected language.
 */
function getType( type ) {
    switch ( getLanguage() ) {
        case "en":
            return type;
        case "de":
            return (type === "earning" ? "Einnahme" : "Ausgabe" );
    }
}

/**
 * This function returns the text for the apply button in the rangedatepicker.
 * @return {String} The text of the apply button in the rangedatepicker.
 */
function getRangeDatePickerApplyButtonText() {
    switch ( getLanguage() ) {
        case "en":
            return "Apply";
        case "de":
            return "Anwenden";
    }
}

/**
 * This function returns the text for the clear button in the rangedatepicker.
 * @return {String} The text of the clear button in the rangedatepicker.
 */
function getRangeDatePickerClearButtonText() {
    switch ( getLanguage() ) {
        case "en":
            return "Clear";
        case "de":
            return "Zur\u00fccksetzen";
    }
}

/**
 * This function returns the text for the cancel button in the rangedatepicker.
 * @return {String} The text of the cancel button in the rangedatepicker.
 */
function getRangeDatePickerCancelButtonText() {
    switch ( getLanguage() ) {
        case "en":
            return "Cancel";
        case "de":
            return "Abbrechen";
    }
}

/**
 * This function returns the text elements for the preset ranges in the rangedatepicker.
 * @return {String[]} The text elements of the preset ranges in the rangedatepicker.
 */
function getRangeDatePickerPresetRangesTextElements() {
    switch ( getLanguage() ) {
        case "en":
            return ["Today", "Yesterday", "Last 7 days", "Last week (Mo-Su)", "Current month", "Previous month", "Current Year", "Last year", "All time"];
        case "de":
            return ["Heute", "Gestern", "Letzte 7 Tage", "Letzte Woche (Mo-So)", "Aktueller Monat", "Letzter Monat", "Aktuelles Jahr", "Letztes Jahr", "Gesamter Zeitraum"];
    }
}

/**
 * This function returns the message for invalid inputs.
 * @return {String} The message for invalid inputs.
 */
function getInvalidInputMessage() {
    switch ( getLanguage() ) {
        case "en":
            return "Invalid input!";
        case "de":
            return "Ung&uuml;ltige Eingabe!";
    }
}

/**
 * This function returns the message in case no transaction was found.
 * @return {String} The message in case no transaction was found.
 */
function getMissingTransactionsMessage() {
    switch ( getLanguage() ) {
        case "en":
            return "No transactions found!";
        case "de":
            return "Es wurden keine Transaktionen gefunden!";
    }
}

/**
 * This function returns the text elements for the transfer dialog.
 * @return {String[]} The text elements for the transfer dialog.
 */
function getTransferDialogTextElements() {
    switch ( getLanguage() ) {
        case "en":
            return ["Here you can transfer money between your budgets.", "From", "To", "Amount"];
        case "de":
            return ["Hier k&ouml;nnen Sie Geld zwischen Ihren Konten &uuml;bertragen.", "Von", "Nach", "Betrag"];
    }
}

/**
 * This function returns the title for the transfer dialog.
 * @return {String} The title for the transfer dialog.
 */
function getTransferDialogTitle() {
    switch ( getLanguage() ) {
        case "en":
            return "Transfer money";
        case "de":
            return "Geld \u00fcbertragen";
    }
}
