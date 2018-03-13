/**
 * This function initializes the page when its loaded. This means it sets the
 * language and some of the content.
 */
function loadPage() {
    setLanguage();
    displayBudgets();
}

/**
 * This function saves new spending entries in json files.
 * @param {String} spending The name of the spending.
 * @param {double} sum The cost of the aquired thing.
 * @param {String} budget The budget from which the sum should be subtracted.
 */
function addSpending( spending, sum, budget ) {
    // First, we get the current time to add this data to the entry.
    var currentTime = new Date();
    var day = currentTime.getDate() < 10 ? "0" + currentTime.getDate().toString() : currentTime.getDate().toString();
    var month = (currentTime.getMonth() + 1) < 10 ? "0" + (currentTime.getMonth() + 1).toString() : (currentTime.getMonth() + 1).toString();
    // Create a JSON object containing the data.
    var spendingObj = {"date": day + "." + month + "." + currentTime.getFullYear().toString(), "name": spending, "amount": sum, "budget": budget};
    // Now store the data in the corresponding json file.
    storeData( month + "." + currentTime.getFullYear().toString(), spendingObj );
}

/**
 * This function displays all currently available budgets.
 */
function displayBudgets() {
    // First, display the standard budget which can never be deleted.
    var currentLanguage = readPreference( "language" );
    var standardBudget = "<li class=\"w3-hover-light-blue w3-display-container\" lang=\"en\">Checking account</li><li class=\"w3-hover-light-blue w3-display-container\" lang=\"de\">Girokonto</li>";
    $( "#currentBudgets" ).append( standardBudget );

    //<li class="w3-hover-light-blue w3-display-container">b<span onclick="this.parentElement.style.display='none'" class="w3-button w3-display-right">&times;</span></li>
    //<li class="w3-hover-light-blue w3-display-container">c<span onclick="this.parentElement.style.display='none'" class="w3-button w3-display-right">&times;</span></li>
}

/**
 * This function creates a new budget.
 * @param {String} name THe name of the budget we want to create.
 */
function addBudget( name ) {

}

/**
 * This function deletes a budget. Before deleting it, we will show a dialog to
 * ask if deleting the budget is really wanted.
 * @param {String} name The name of the budget we want to delete.
 */
function deleteBudget( name ) {
    console.log(name);
}
