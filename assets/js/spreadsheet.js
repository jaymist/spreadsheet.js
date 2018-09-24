//-----------------------------------------------------------------------------
// GLOBAL VARIABLES
//-----------------------------------------------------------------------------
var gCharCodeA  = "A".charCodeAt (); // Comes out as '65'
var gCharCount  = 26;

function PositionToStr (pos) {
    var remainder   = pos % gCharCount;
    var quotient    = Math.floor (pos / gCharCount );
    var str         = String.fromCharCode (remainder + gCharCodeA);

    if (quotient < 1)
        return str;

            // Get whole number quotient
    str = String.fromCharCode (quotient + gCharCodeA - 1) + str;
    return str;
};

// Create a new grid within the window.
function CreateTable (parent) {
    var table = $("<table>");

    table.appendTo (parent);

    InsertTableHeading (table);
};

// Create top table row and add to parent.
function InsertTableHeading (parent) {
    var row = $("<tr>");
    row.addClass ("heading-row");

    var heading      = $("<th>");
    heading.addClass ("heading");
    heading.appendTo (row);

            // Create the initial header row.
    for (x = 0; x < 100; ++x)
    {
        var heading      = $("<th>");
        heading.addClass ("heading");
    
                    // Convert for loop position to ASCII characters from A..ZZ
        var headerText   = PositionToStr (x);
        console.log      ("Character string: %s", headerText);

        heading.text     (headerText);
        heading.appendTo (row);
    }

    row.appendTo (parent);
}

//-----------------------------------------------------------------------------
// MAIN ENTRY POINT
//-----------------------------------------------------------------------------
$(document).ready (function () {
            // When the document is ready, let's create the grid.
            // Let's add a 'div' to contain the table.
    var tableDiv = $("<div/>");

    tableDiv.attr     ("id", "table-div");
    tableDiv.appendTo ($("body"));

            // Now create the table and embed it within the tableDiv.
    CreateTable (tableDiv);
});
