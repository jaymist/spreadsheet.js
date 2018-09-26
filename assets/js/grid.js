function Grid () {
            // Map of cells to literal values
    this.mValues    = {};
            // Map of cells to content that look like an equation
    this.mEquations = {};
            // Map of cells that referenced in an equation.
    this.mReferences = {};
};

Grid.prototype.AddValue = function (key, value) {
    this.mValues.key = value;
};

Grid.prototype.AqqEquation = function (key, value) {
    this.mEquations.key = value;
};

Grid.prototype.AddReference = function (key, value) {
    this.mReferences.key = value;
};

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
    var key;

    if (typeof cell != "string")
        key = cell.attr ("id");
    else
        key = cell;

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