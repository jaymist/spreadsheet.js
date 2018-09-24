//-----------------------------------------------------------------------------
// GLOBAL VARIABLES
//-----------------------------------------------------------------------------
var gCharCodeA  = "A".charCodeAt (); // Comes out as '65'
var gCharCount  = 26;

//-----------------------------------------------------------------------------
// TABLE METHODS
// This section contains functions to generate the initial table.
//-----------------------------------------------------------------------------
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
    table.addClass ("spreadsheet")

    table.appendTo (parent);

    InsertTableHeading (table);
    InsertTableBody    (table);
};

// Create top table row and add to parent.
function InsertTableHeading (parent) {
    var row = $("<tr>");
    row.addClass ("spreadsheet");

    var heading      = $("<th>");
    heading.addClass ("sheet-heading");
    heading.appendTo (row);

            // Create the initial header row.
    for (x = 0; x < 100; ++x)
    {
        var heading      = $("<th>");
        heading.addClass ("sheet-heading");
    
                    // Convert for loop position to ASCII characters from A..ZZ
        var headerText   = PositionToStr (x);
        heading.text     (headerText);
        heading.appendTo (row);
    }

    row.appendTo (parent);
}

// Create table body and add to parent.
function InsertTableBody (parent) {
            // Create the initial header row.
    for (y = 1; y < 101; ++y)
    {
        var row = $("<tr>");
        row.addClass ("spreadsheet");
    
        for (x = 0; x < 101; ++x)
        {
            var elem = $("<td>");

            if (x == 0)
            {
                elem.addClass ("sheet-heading")
                elem.text (y);
            }
            else
            {
                elem.attr ("id", PositionToStr (x - 1) + y);
                elem.on ("mouseenter", CellMouseEnter)
                elem.on ("mouseleave", CellMouseLeave)
            }

            elem.addClass ("spreadsheet");
            elem.appendTo (row);
        }
        row.appendTo (parent);
    }
}

//-----------------------------------------------------------------------------
// CALLBACKS
// Callbacks for events on the spreadsheet.
//-----------------------------------------------------------------------------

// When the mouse enters a cell, thicken the border
function CellMouseEnter () {
    var cellId = this.id;
    var cell   = $("#" + cellId);
    cell.addClass ("spreadsheet-enter");
};

// When the mouse enters a cell, thicken the border
function CellMouseLeave () {
    var cellId = this.id;
    var cell   = $("#" + cellId);
    cell.removeClass ("spreadsheet-enter");
};

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
