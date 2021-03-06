//-----------------------------------------------------------------------------
// GLOBAL VARIABLES
//-----------------------------------------------------------------------------
var gCharCodeA  = "A".charCodeAt (); // Comes out as '65'
var gCharCount  = 26;
var grid;

//-----------------------------------------------------------------------------
// MENU METHODS
// This section contains functions to generate the initial menu.
//-----------------------------------------------------------------------------
function CreateMenu (parent) {
    var refreshButton  = $("<button>");
    refreshButton.text ("Refresh");
    refreshButton.on   ("click", RefreshButtonClick);

    refreshButton.appendTo (parent);
};

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
                elem.on ("mouseenter", CellMouseEnter);
                elem.on ("mouseleave", CellMouseLeave);
                elem.on ("click",      CellMouseClick);
            }

            elem.addClass ("spreadsheet");
            elem.appendTo (row);
        }
        row.appendTo (parent);
    }
}

function FormatCell (key, cell) {
    if (key == "b")
    {
        if (cell.css ("font-weight") == 700)    // 700 = bold
            cell.css ("font-weight", "normal");
        else
            cell.css ("font-weight", "bold");
    }
    else if (key == "i")
    {
        if (cell.css ("font-style") == "italic")
            cell.css ("font-style", "normal");
        else
            cell.css ("font-style", "italic");
    }
    else if (key == "u")
    {
        if (cell.css ("text-decoration-line") == "underline")
            cell.css ("text-decoration-line", "none");
        else
            cell.css ("text-decoration-line", "underline");
    }
    else
        return false;

    return true;
};

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

// When a cell is clicked, make it editable
function CellMouseClick () {
    var cellId = this.id;
    var cell   = $("#" + cellId);
    cell.attr  ("contenteditable", "true");
    cell.focus ();

    cell.on ("keydown", function (e) {
                // Ctrl key was held down whilst the event fired.
        if (e.ctrlKey)
        {
            if (FormatCell (e.key, cell))
                e.preventDefault ();

            return;
        }

        if (e.key != "Enter")
            return;
        
        cell.removeAttr ("contenteditable");
        grid.SetValue (cell);
    });

    cell.on ("keyup", function () {
        grid.StoreValue (cell);
    });
};

// When the refresh button is clicked, refresh the grid and restore saved values
function RefreshButtonClick () {
            // Remove the current grid - is this a bit heavy-handed?
    var tableDiv   = $("#table-div");
    tableDiv.empty ();
    CreateTable    (tableDiv);

    grid.RefreshValues ();
};

//-----------------------------------------------------------------------------
// MAIN ENTRY POINT
//-----------------------------------------------------------------------------

$(document).ready (function () {
    grid = new Grid ();
    console.log (grid);

            // Add menu bar div with useful buttons.
    var menuDiv      = $("<div>");

    menuDiv.attr     ("id", "menu-div");
    menuDiv.appendTo ($("body"));

    CreateMenu (menuDiv);

            // When the document is ready, let's create the grid.
            // Let's add a 'div' to contain the table.
    var tableDiv      = $("<div/>");

    tableDiv.attr     ("id", "table-div");
    tableDiv.appendTo ($("body"));

            // Now create the table and embed it within the tableDiv.
    CreateTable (tableDiv);
});
