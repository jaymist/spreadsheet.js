// Create a new grid within the window.
function CreateTable (parent) {
    var table = $("<table/>");

    table.appendTo (parent);
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
