//-----------------------------------------------------------------------------
// GLOBAL VARIABLES
//-----------------------------------------------------------------------------
var gCharCodeA  = "A".charCodeAt (); // Comes out as '65'
var gCharCount  = 26;
var gValueDict  = {};               // Global store of cell id vs. cell content

// Dictionary of cells that have formulas that point to them.
// This is used when a cell is updated, to determin which
// other cells reference them (via a formula) and need updating
var gReferences = {};

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

// Find any references to the updated cell and recalculate their content.
function UpdateReferences (updatedCell) {
    var references = gReferences[updatedCell.attr ("id")];

            // If we don't have any references to the caller, return early.
    if (!references || references.length === 0)
        return;

            // Otherwise iterate over the references, get the value stored in
            // memory and update the result.
    references.forEach (id => {
        var inMemVal = gValueDict[id];
        if (!inMemVal)
        {
            console.error ("Invalid in-memory value for cell: %s", id);
            return;
        }

        var cell = $("#" + id);
        if (!cell)
        {
            console.error ("Unable to update cell, invalid id: %s", id);
            return;
        }

        var val = CalculateResult (inMemVal, cell);
        cell.text (val);
    });
};

// Check if the cell contains a formula and, if it does, attempt to apply it.
function CalculateResult (content, cell) {
    if (!content.startsWith ("="))
        return content;

    var equation = content.substr (1);      // remove the leading '=' symbol.

    while ((res = equation.match (/([A-Za-z]+\d+)/)))
    {
        var key   = res[1].toUpperCase ();
        var value = $("#" + key).text ();

        if (!value)
            return "#ERROR";
        
                // Check if the key is already in our global set and if not,
                // initialise it.
        if (!gReferences[key])
            gReferences[key] = new Set ();

        gReferences[key].add (cell.attr ("id"));

                // Update equation, replacing cell id with cell value;
        equation = equation.replace (res[1], value);
    }

    return eval (equation);
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

    cell.on    ("keydown", function (e) {
        var cellId  = this.id;
        var cell    = $("#" + cellId);
        var code    = e.which;
        var content = cell.text ();
        
        gValueDict[cell.attr ("id")] = content;         // Store original content, *NOT* calculated content

                // Don't need to do anything until the user hits enter
        if (code != 13)
            return;

        cell.removeAttr  ("contenteditable");                // Make sure the cell is no longer editable
        content          = $.trim (content);                 // Remove trailing newline
        cell.text        (CalculateResult (content, cell));  // Set cell content to trimmed string
        UpdateReferences (cell);
    });
    cell.focus ();
};

// When the refresh button is clicked, refresh the grid and restore saved values
function RefreshButtonClick () {
            // Remove the current grid - is this a bit heavy-handed?
    var tableDiv   = $("#table-div");
    tableDiv.empty ();
    CreateTable    (tableDiv);

            // Iterate over stashed values and insert into grid
    $.each (gValueDict, function (key, value) {
        var cell  = $("#" + key);
        cell.text (CalculateResult (value, cell));
    });
};

//-----------------------------------------------------------------------------
// MAIN ENTRY POINT
//-----------------------------------------------------------------------------
$(document).ready (function () {
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
