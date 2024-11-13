const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');

function setupOptions(yargsInstance){
    yargsInstance
        .option("dev", {
            alias: "d",
            type: "boolean",
            description: "Start in development mode",
        })
        .option("link", {
            alias: "l",
            type: "string",
            description: "Link to the server",
            default: "https://fusion.ct8.pl",
        })
        .option("rpc-port", {
            type: "number",
            description: "RPC server port (try)",
            default: 58888,
        });
}

function setupCommands(yargsInstance){
    yargsInstance
        .command("version", "Show version", () => {
            console.log(require("../package.json").version);
            process.exit(0);
        })
}

function setupAliases(yargsInstance){
    yargsInstance
        .alias("version", "v");
}

function checkArgs(yargsInstance){
    yargsInstance
        .check((argv) => {
            if(argv['rpc-port'] < 1024 || argv['rpc-port'] > 65535){
                throw new Error("RPC port must be between 1024 and 65535");
            }
            return true;
        });
}

function parseArgs(){
    const yargsInstance = yargs(hideBin(process.argv));
    setupOptions(yargsInstance);
    setupCommands(yargsInstance);
    setupAliases(yargsInstance);
    checkArgs(yargsInstance);

    return yargsInstance
        .argv;
}

module.exports = parseArgs;
