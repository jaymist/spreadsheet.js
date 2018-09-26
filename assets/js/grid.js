function Grid () {
            // Map of cells to literal values
    this.mValues    = {};
            // Map of cells to content that look like an equation
    this.mEquations = {};
            // Map of cells that referenced in an equation.
    this.mReferences = {};
};

Grid.prototype.GetId = function (cell) {
    if (typeof cell === "string")
        return cell
    
    return cell.attr ("id");
}

Grid.prototype.EvaluateEquation = function (cell, content) {
    console.log ("Evaluating equation.");
    var equation = content.substr (1);      // remove the leading '=' symbol.

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

Grid.prototype.CalculateValue = function (cell, content) {
            // If the content doesn't start with an '=' sign, assume it's a value.
    var key = this.GetId (cell);

    if (!content.startsWith ("="))
    {
        console.log ("Storing value: %s", content);
        this.mValues[key] = content;
        return content;
    }
    else
    {
        console.log ("Storing equation: %s", content);
        this.mEquations[key] = content;
        return this.EvaluateEquation (key, content);
    }
};

Grid.prototype.UpdateReferences = function (modifiedCell) {
    var key = this.GetId (modifiedCell);

    var references = this.mReferences[key];

            // If we don't have any references to the caller, return early.
    if (!references || references.length == 0)
        return;

            // Otherwise iterate over the references, get the value stored in
            // memory and update the result.
    references.forEach (id => {
        var equation = this.mEquations[id];
        if (!equation)
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

        var val = this.CalculateValue (cell, equation);
        cell.text (val);
    });
}