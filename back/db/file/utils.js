const fs = require("fs");
const readline = require("readline");

/**
 * Repairs a file path by replacing double slashes
 * @private
 * @param {string} path - The file path to repair.
 * @returns {string} The repaired file path.
 */
function pathRepair(path){
    return path.replaceAll("//", "/");
}

/**
 * Creates a Readline interface for reading large files with a specified high water mark.
 * @private
 * @param {string} file - The file path to create a Readline interface for.
 * @returns {readline.Interface} The Readline interface.
 */
function createRL(file){
    const read_stream = fs.createReadStream(file, { highWaterMark: 10 * 1024 * 1024 }); //10MB
    const rl = readline.createInterface({
        input: read_stream,
        crlfDelay: Infinity
    });
    return rl;
}

module.exports = { pathRepair, createRL };