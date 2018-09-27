function Grid () {
            // Map of cells to literal values
    this.mValues     = {};
            // Map of cells to content that look like an equation
    this.mEquations  = {};
            // Map of cells that referenced in an equation.
    this.mReferences = {};
};

Grid.prototype.GetId = function (cell) {
    if (typeof cell === "string")
        return cell
    
    return cell.attr ("id");
};

Grid.prototype.NormaliseEquation = function (equation) {
    var result = equation.substr (1);   // Remove leading '='.
    result     = result.toUpperCase (); // Normalise to upper case
    result     = result.replace (/\s*/g, "");    // Remove all whitespace.
    return result;
};

Grid.prototype.StoreValue = function (cell) {
            // Get the cell's id and content
    var key     = this.GetId (cell);
    var content = cell.text ();

    if (!content.startsWith ("="))
    {
        this.mValues[key] = content;
    }
    else
    {
        this.mEquations[key] = content;
        this.mValues[key]    = this.EvaluateEquation (key, content);
    }

            // Returns the key of the cell that's been updated.
    return key;
};

Grid.prototype.SetValue = function (cell) {
    var key = this.StoreValue (cell);
    cell.text (this.mValues[key]);

    this.UpdateReferences (key);
};

Grid.prototype.EvaluateEquation = function (cell, content) {
    var equation = this.NormaliseEquation (content);

    console.info ("Equation: %s", equation);

    while ((res = equation.match (/([A-Za-z]+\d+)/)))
    {
        var key   = res[1].toUpperCase ();
        var value = $("#" + key).text ();

        if (!value)
            return "#ERROR";
        
                // Check if the key is already in our global set and if not,
                // initialise it.
        if (!this.mReferences[key])
            this.mReferences[key] = new Set ();

        this.mReferences[key].add (cell);

                // Update equation, replacing cell id with cell value;
        equation = equation.replace (res[1], value);
    }

    return eval (equation);
};

Grid.prototype.UpdateReferences = function (key) {
    var references = this.mReferences[key];

            // If we don't have any references to the caller, return early.
    if (!references || references.length == 0)
        return;

            // Otherwise iterate over the references, get the value stored in
            // memory and update the result.
    references.forEach (id => {
        var equation = this.mEquations[id];
        if (!equation)
            return;

        var cell = $("#" + id);
        if (!cell)
            return;

        var val = this.EvaluateEquation (key, equation);
        cell.text (val);
    });
}

Grid.prototype.RefreshValues = function () {
        // Iterate over stashed values and insert into grid
    $.each (this.mValues, function (key, value) {
        var cell  = $("#" + key);
        cell.text (value);
    });
};
