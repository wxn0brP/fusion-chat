const { Command } = require("commander");
const chalk = require("chalk");
const fs = require("fs");
const path = require("path");

const cfgDir = path.join(__dirname, "cfg");
if(!fs.existsSync(cfgDir)){
    fs.mkdirSync(cfgDir);
}

const configPath = path.join(__dirname, "cfg/dbs.json");
if(!fs.existsSync(configPath)){
    fs.writeFileSync(configPath, "{}", "utf8");
}

global.dbConfig = require(configPath);
global.lo = console.log;

const program = new Command();

function saveConfig(){
    fs.writeFileSync(configPath, JSON.stringify(dbConfig, null, 2), "utf8");
}

program
    .command("list")
    .description("List all databases")
    .action(() => {
        const dbs = Object.keys(dbConfig);
        if(dbs.length === 0){
            console.log(chalk.yellow("No databases configured."));
        }else{
            console.log(chalk.green("Configured databases:"), dbs.join(", "));
        }
    });

program
    .command("add <name> <folder>")
    .description("Add a new database")
    .action((name, folder) => {
        if(dbConfig[name]){
            console.log(chalk.red("Database with this name already exists."));
        }else{
            dbConfig[name] = folder;
            saveConfig();
            console.log(chalk.green("Database added:"), name);
        }
    });

program
    .command("rm <name>")
    .description("Remove a database")
    .action((name) => {
        if(dbConfig[name]){
            delete dbConfig[name];
            saveConfig();
            console.log(chalk.green("Database removed:"), name);
        }else{
            console.log(chalk.red("Database not found."));
        }
    });

program
    .command("auto-add <folder>")
    .description("Automatically add all databases from <folder>")
    .action((folder) => {
        const dbs = fs.readdirSync(folder, { withFileTypes: true }).filter(dirent => dirent.isDirectory()).map(dirent => dirent.name);
        for(const db of dbs){
            if(dbConfig[db]) continue;
            dbConfig[db] = folder + "/" + db;
            console.log(chalk.green("Database added:"), db);
        }
        saveConfig();
    });

program
    .command("use")
    .description("Work with a selected database (interactive mode)")
    .action(async () => {
        const dbNames = Object.keys(dbConfig);
        if(dbNames.length === 0){
            console.log(chalk.red("No databases configured. Please add a database first."));
            return;
        }
        global.runMode = "interactive";

        await require("./interactive")();
    });

program
    .command("noi <operations...>")
    .description("Disable interactive mode. Load operations from <operations...>")
    .action((operations) => {
        const dbNames = Object.keys(dbConfig);
        if(dbNames.length === 0){
            process.exit(2);
        }
        global.runMode = "no interactive";

        require("./no-interaction")(operations);
    });

program
    .command("noif <file>")
    .description("Disable interactive mode. Load operations from <file>")
    .action((file) => {
        if(!fs.existsSync(file)){
            process.exit(3);
        }

        const dbNames = Object.keys(dbConfig);
        if(dbNames.length === 0){
            process.exit(2);
        }

        global.runMode = "no interactive";

        const operations = fs.readFileSync(file, "utf8").split("\n").filter(line => !!line);
        require("./no-interaction")(operations);
    });

program.parse(process.argv);
