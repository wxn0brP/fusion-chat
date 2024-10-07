const { Command } = await import("commander");
import chalk from "chalk";
import { existsSync, mkdirSync, writeFileSync, readdirSync, readFileSync } from "fs";
import { join } from "path";

global.__dirname = import.meta.dirname;

const cfgDir = join(__dirname, "cfg");
if(!existsSync(cfgDir)){
    mkdirSync(cfgDir);
}

const configPath = join(__dirname, "cfg/dbs.json");
if(!existsSync(configPath)){
    writeFileSync(configPath, "{}", "utf8");
}

global.dbConfig = JSON.parse(readFileSync(configPath, "utf8") || "{}");
global.lo = console.log;

const program = new Command();

function saveConfig(){
    writeFileSync(configPath, JSON.stringify(dbConfig, null, 2), "utf8");
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
        const dbs = readdirSync(folder, { withFileTypes: true }).filter(dirent => dirent.isDirectory()).map(dirent => dirent.name);
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

        import("./interactive.js").then(module => {
            module.default();
        })
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

        import("./no-interaction.js").then(module => {
            module.default(operations);
        });
    });

program
    .command("noif <file>")
    .description("Disable interactive mode. Load operations from <file>")
    .action((file) => {
        if(!existsSync(file)){
            process.exit(3);
        }

        const dbNames = Object.keys(dbConfig);
        if(dbNames.length === 0){
            process.exit(2);
        }

        global.runMode = "no interactive";

        const operations = readFileSync(file, "utf8").split("\n").filter(line => !!line);
        import("./no-interaction.js").then(module => {
            module.default(operations);
        });
    });

program.parse(process.argv);
