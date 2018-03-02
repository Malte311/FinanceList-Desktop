/**
 * This function determines which language is selected and then executes the
 * correct styling.
 */
function setLanguage() {
    var sel = document.getElementById( "language" );
    var sheet = document.createElement( "style" );
    // Determine which language is selected
    if ( sel.options[sel.selectedIndex].text === "Deutsch" ) {
        console.log("DE");
    }
    else if ( sel.options[sel.selectedIndex].text === "English" ) {
        sheet.innerHTML = "span:lang(de) { display: none }";
        document.body.appendChild( sheet );

        console.log("EN");
    }
}




var ctx = document.getElementById("myChart");
ctx.width="6000";
ctx.height="2000";

var spendingChart;

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
] );
