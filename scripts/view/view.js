/**
 * This file provides some function for displaying elements.
 *
 * @author Malte311
 */

 /**
  * This function adds a single zero ($2.5 => $2.50) for a more beautiful display style.
  * @param {String} amount The amount to which we want to add a zero.
  * @return {String} The amount with an additional zero, if neccessary.
  */
function beautifyAmount( amount ) {
    var beautifiedAmount = amount.toString();
    // Make sure that a decimal point exists
    if ( amount.toString().indexOf( "." ) !== -1 ) {
        // Less than two decimal places? Add a zero.
        if ( amount.toString().split( "." )[1].length < 2 ) {
            beautifiedAmount = amount.toString() + "0";
        }
    }
    // No decimal point? => Add two zeros.
    else {
        beautifiedAmount = amount.toString() + ".00";
    }
    return beautifiedAmount;
}
