var gSumRegex = new RegExp (/SUM\((.*?)\)/);
var gMaxRegex = new RegExp (/MAX\((.*?)\)/);

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

Grid.prototype.ExpandRanges = function (equation) {
    while ((res = equation.match (/([A-Z]+)(\d+):([A-Z]+)(\d+)/)))
    {
        var matchStr    = res[0];
        var startChar   = res[1];
        var startNum    = res[2];
        var endNum      = res[4];

                // If the numbers don't match; i.e. it's A1:A10
                // let's work our way up through the numbers.
        if (startNum != endNum)
        {
            var start = startNum;
            var end   = endNum;
            var str   = "";

                    // If the range is backwards (i.e. A10:A1), we need to swap
                    // the start and end. 
            if (endNum < startNum)
            {
                start = endNum;
                end   = startNum;
            }

            for (i = start; i < end; ++i)
                str     += startChar + i + ",";

            str     += startChar + i;
        }

        equation = equation.replace (matchStr, str);
    }
    return equation;
};

Grid.prototype.ToNumArray = function (strVals) {
    var strArr = strVals.split (",");
    var numArr = [];

    strArr.forEach (strVal => {
        numArr.push (parseFloat (strVal));
    });

    return numArr;
};

Grid.prototype.ExpandSumFunction = function (equation) {
    while ((res = equation.match (gSumRegex)))
    {
        var origStr   = res[0];
        var numArr    = this.ToNumArray (res[1]);
        var sumResult = numArr.reduce ((a,b) => a + b, 0);

        equation = equation.replace (origStr, sumResult);
    }

    return equation;
};

Grid.prototype.MaxFunc = function (equation) {
    while ((res = equation.match (gMaxRegex)))
    {
        var origStr = res[0];
        var numArr  = this.ToNumArray (res[1]);
        var maxVal = Math.max (...numArr);

        equation = equation.replace (origStr, maxVal);
    }

    return equation;
};

Grid.prototype.StoreValue = function (cell, evalEqtn = false) {
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
        if (evalEqtn)
            this.mValues[key]    = this.EvaluateEquation (key, content);
    }

            // Returns the key of the cell that's been updated.
    return key;
};

Grid.prototype.SetValue = function (cell) {
    var key = this.StoreValue (cell, true);
    cell.text (this.mValues[key]);

    this.UpdateReferences (key);
};

Grid.prototype.EvaluateEquation = function (cell, content) {
    var equation = this.NormaliseEquation (content);
    equation     = this.ExpandRanges (equation);

    while ((res = equation.match (/([A-Z]+\d+)/)))
    {
        var key   = res[1];
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

            // If the equation contains a sum function, replace it with the expanded values.
    if (equation.search (gSumRegex) >= 0)
        equation = this.ExpandSumFunction (equation);

    if (equation.search (gMaxRegex) >= 0)
        equation = this.MaxFunc (equation);

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
