/**
 * This function updates the content if the user clicks the update button to apply filters.
 */
function updateContent() {
    // Check for controls
    if ( $( "#graph" ).length ) {
        // Get all the information from input elements and save them in variables first.
        // Get the selected display type (graph/table).
        var displayType = $( "#graph" )[0].checked ? "graph" : "table";
        // Find out, if a budget is selected, and if yes, which one.
        var budget;
        // Budget selected?
        if ( $( "#budgetSelect" )[0].selectedIndex !== 0 ) {
            // Get the name of the selected budget.
            budget = $( "#budgetSelect option:selected" ).text();
        }
        // No budget selected?
        else {
            // Save an empty string.
            budget = "";
        }
        // Find out, if a type is selected, and if yes, which one.
        var type;
        // Type selected?
        if ( $( "#typeSelect" )[0].selectedIndex !== 0 ) {
            // Find out which type is selected.
            // Earning?
            if ( $( "#typeSelect" )[0].selectedIndex === 1 ) type = "earning";
            // Spending?
            else if ( $( "#typeSelect" )[0].selectedIndex === 2 ) type = "spending";
        }
        // No type selected?
        else {
            // Save an empty string.
            type = "";
        }
        // Get the input from the date range picker to get a date range.
        var date = $( "#dateSelect" ).daterangepicker( "getRange" );
        // Set start and end date to null, in case nothing was selected.
        var startDate = null, endDate = null;
        // Date selected? (No date selected will leave startDate and endDate with null)
        if ( date !== null && date !== undefined ) {
            // Get the selected start and end date.
            startDate = date.start;
            endDate = date.end;
        }
        // Get the input for amounts. If they are empty, we save the empty string.
        var amountFrom = $( "#amountFrom" ).val().trim();
        var amountTo = $( "#amountTo" ).val().trim();
        // Find out which name is selected. If no name is selected, we save the empty string.
        var name = $( "#nameSelect" ).val().trim();
        // Find out which category is selected. If no category is selected, we save the empty string.
        var category = $( "#categorySelect" ).val().trim();
        // Now display the filtered content.
        displayContent( displayType, budget, type, startDate, endDate, amountFrom,
                        amountTo, name, category );
    }
    // No controls available yet: Set default values.
    else {
        displayContent( "graph", "", "spending", null, null, "", "", "", "" );
    }
}

/**
 * This function sorts a table by a given parameter.
 * @param {number} n The number which specifies the sorting parameter:
 * 0: Date, 1: Name, 2: Sum, 3: Category, 4: Budget, 5: Type
 * This function is taken from: https://www.w3schools.com/howto/howto_js_sort_table.asp
 */
function sortTable( n ) {
    var table = document.getElementById( "overviewTable" );
    var rows, switching, x, y, shouldSwitch, dir, switchcount = 0;
    switching = true;
    // Set the sorting direction to ascending:
    dir = "asc";
    // Make a loop that will continue until no switching has been done:
    while ( switching ) {
        // Start by saying: no switching is done:
        switching = false;
        rows = table.rows;
        // Loop through all table rows (except the first, which contains table headers):
        for ( var i = 1; i < (rows.length - 1); i++ ) {
            // Start by saying there should be no switching:
            shouldSwitch = false;
            // Get the two elements you want to compare, one from current row and one from the next:
            x = rows[i].getElementsByTagName( "TD" )[n];
            y = rows[i + 1].getElementsByTagName( "TD" )[n];
            // Check if the two rows should switch place, based on the direction, asc or desc:
            if ( dir == "asc" ) {
                if ( compare(x.innerHTML.toLowerCase(), y.innerHTML.toLowerCase(), n) ) {
                    // If so, mark as a switch and break the loop:
                    shouldSwitch = true;
                    break;
                }
            }
            else if ( dir == "desc" ) {
                if ( compare(y.innerHTML.toLowerCase(), x.innerHTML.toLowerCase(), n) ) {
                    // If so, mark as a switch and break the loop:
                    shouldSwitch = true;
                    break;
                }
            }
        }
        if ( shouldSwitch ) {
            // If a switch has been marked, make the switch and mark that a switch has been done:
            rows[i].parentNode.insertBefore( rows[i + 1], rows[i] );
            switching = true;
            // Each time a switch is done, increase this count by 1:
            switchcount ++;
        }
        else {
            // If no switching has been done AND the direction is "asc",
            // set the direction to "desc" and run the while loop again.
            if ( switchcount == 0 && dir == "asc" ) {
                dir = "desc";
                switching = true;
            }
        }
    }
}

/**
 * Compares two strings s1, s2. Sometimes we need a special treatment.
 * @param {String} s1 The first string.
 * @param {String} s2 The second string.
 * @param {number} n Specifies the type:
 * 0: date (has to be reversed for comparison),
 * 2: sum (has to be compared as a number instead of as a string)
 * @return {bool} Returns if s1 > s2
 */
function compare( s1, s2, n ) {
    // reversing required
    if ( n == 0 ) {
        s1 = s1.split( "." )[2] + "." + s1.split( "." )[1] + "." + s1.split( "." )[0];
        s2 = s2.split( "." )[2] + "." + s2.split( "." )[1] + "." + s2.split( "." )[0];
    }
    // float comparison required
    else if ( n == 2 ) {
        s1 = parseFloat( s1 );
        s2 = parseFloat( s2 );
    }
    return s1 > s2;
}

/**
 * Deletes a given entry.
 * @param {String} entry The id (timestamp) of the entry we want to delete.
 */
function deleteEntry( entry ) {
    createDialog( textElements.reallyDeleteEntryTitle, textElements.reallyDeleteEntry, function() {
		let DateHandler = require('../scripts/utils/dateHandler.js');
		var dateAsString = DateHandler.timestampToString( entry );
        var file = dateAsString.split(".")[1] + "." +
                   dateAsString.split(".")[2] + ".json";

        deleteData( file, entry );
        updateView();
        $( this ).dialog( "close" );
    });
}
