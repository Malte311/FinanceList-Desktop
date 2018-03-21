/**
 * This function initializes the page when its loaded. This means it sets the
 * language and some of the content.
 */
function loadPage() {
    // We will always set the language first.
    setLanguage( readPreference( "language" ) );
    // Display recent spendings, if they exist.
    displayRecentSpendings();
    test();
}

function test() {
    var ctx = document.getElementById("pieChart");
    ctx.width="6000";
    ctx.height="2000";

    createChart( ctx, ["Red", "Blue", "Yellow", "Green", "Purple", "Orange"], [12, 19, 3, 5, 2, 3], [
        'rgba(255,99,132,1)',
        'rgba(54, 162, 235, 1)',
        'rgba(255, 206, 86, 1)',
        'rgba(75, 192, 192, 1)',
        'rgba(153, 102, 255, 1)',
        'rgba(255, 159, 64, 1)'
    ], [
        'rgba(255,99,132,1)',
        'rgba(54, 162, 235, 1)',
        'rgba(255, 206, 86, 1)',
        'rgba(75, 192, 192, 1)',
        'rgba(153, 102, 255, 1)',
        'rgba(255, 159, 64, 1)'
    ], readPreference( "chartType" ) );
}
