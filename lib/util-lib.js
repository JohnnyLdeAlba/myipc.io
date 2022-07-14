const fs = require("fs").promises;

function util_log(file, output)
{
    fs.appendFile(file, output + "\n")
        .catch(err => null);
}

const UtilLib = { util_log: util_log };

module.exports = UtilLib;
