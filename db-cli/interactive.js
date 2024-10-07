import inquirer from "inquirer";
import chalk from "chalk";
import ext from "./ext.js";
import { add, find, findOne, update, updateOne, remove, removeOne, updateOneOrAdd } from "./dbFunc.js";
import init from "./init.js";

async function selectDatabase(){
    const dbNames = Object.keys(dbConfig);
    if(dbNames.length === 0){
        console.log(chalk.red("No databases found. Add a database first."));
        process.exit(1);
    }

    const { selectedDb } = await inquirer.prompt([
        {
            type: "list",
            name: "selectedDb",
            message: "Select a database:",
            choices: dbNames,
            loop: false
        },
    ]);

    return selectedDb;
}

async function promptForKeyValuePairs(){
    const data = {};

    while(true){
        const { key, value } = await inquirer.prompt([
            { name: "key", message: "Key:" },
            { name: "value", message: "Value:", when: (answers) => answers.key !== "" },
        ]);

        if(key === "") break;
        data[key] = value;
    }

    return data;
}

async function waitEnter(){
    await inquirer.prompt([
        { name: "enter", message: "Press enter to continue..." }
    ]);
}

async function mainMenuWindow(){
    if(selected.dbName) console.log(chalk.yellow("Selected database:"), selected.dbName);
    if(selected.table) console.log(chalk.yellow("Selected table:"), selected.table);

    const { operation } = await inquirer.prompt([
        {
            type: "list",
            name: "operation",
            message: "Choose an operation:",
            choices: [
                { name: "Find one data", value: "findOne" },
                { name: "Find data", value: "find" },
                { name: "Update one data", value: "updateOne" },
                { name: "Add data", value: "add" },
                new inquirer.Separator(),
                
                "Select db",
                "Select list table",
                "Select text table",
                "Display tables",
                new inquirer.Separator(),
                
                { name: "Update data", value: "update" },
                { name: "Remove data", value: "remove" },
                { name: "Remove one data", value: "removeOne" },
                { name: "Update one or Add data", value: "updateOneOrAdd" },
                new inquirer.Separator(),

                "Exit"
            ],
            loop: false
        },
    ]);

    if(operation === "Exit"){
        console.log(chalk.blue("Exiting..."));
        return true;
    }

    if(operation === "Select db"){
        const dbName = await selectDatabase();
        selected.db = global.databases[dbName];
        selected.dbName = dbName;
        console.log(chalk.green("Database selected."));
    }

    if(operation === "Select text table"){
        const { table } = await inquirer.prompt([
            { name: "table", message: "Table:" },
        ]);
        selected.table = table;
        console.log(chalk.green("Table selected."));
    }

    if(operation === "Select list table"){
        if(!selected.db){
            console.log(chalk.red("Please select a database first."));
            return;
        }
        const choicesRaw = await selected.db.getDBs();
        const choices = await ext.process("list_table", selected.dbName, null, choicesRaw);

        const { table } = await inquirer.prompt([
            {
                type: "list",
                name: "table",
                message: "Table:",
                choices: choices,
                loop: false
            },
        ]);
        selected.table = table;
        console.log(chalk.green("Table selected."));
    }

    if(operation === "Display tables"){
        if(!selected.db) return;
        const tables = await selected.db.getDBs();
        const extTables = await ext.process("display_table", selected.dbName, null, tables);
        console.log("\n", chalk.green("Tables:"), extTables, "\n");
        await waitEnter();
    }

    if(!selected.db || !selected.table){
        console.log(chalk.red("Please select a database and table first."));
        return;
    }

    if(operation === "add"){
        const data = await promptForKeyValuePairs();
        const extData = await dbFunc.add(selected, data);
        console.log(chalk.green("Data added:"), extData);
    }

    if(operation === "find"){
        const search = await promptForKeyValuePairs();
        const results = await find(selected, search);

        console.log("\n", chalk.green("Found data:"), "\n", results, "\n");
        await waitEnter();
    }
    
    if(operation === "findOne"){
        const search = await promptForKeyValuePairs();
        const result = await findOne(selected, search);

        console.log("\n", chalk.green("Found data:"), "\n", result, "\n");
        await waitEnter();
    }

    if(operation === "update"){
        const search = await promptForKeyValuePairs();
        console.log(chalk.yellow("Now enter the new values:"));
        const data = await promptForKeyValuePairs();
        
        const updated = await update(selected, search, data);
        console.log(chalk.green(updated ? "Data updated." : "Nothing to update."));
    }

    if(operation === "updateOne"){
        const search = await promptForKeyValuePairs();
        console.log(chalk.yellow("Now enter the new values:"));
        const data = await promptForKeyValuePairs();
        
        const updated = updateOne(selected, search, data);
        console.log(green(updated ? "Data updated." : "Nothing to update."));
    }

    if(operation === "remove"){
        const search = await promptForKeyValuePairs();
        
        await remove(selected, search);
        console.log(chalk.green("Data removed."));
    }

    if(operation === "removeOne"){
        const search = await promptForKeyValuePairs();
        
        const removed = await removeOne(selected, search);
        console.log(chalk.green(removed ? "Data removed." : "Nothing to remove."));
    }

    if(operation === "updateOneOrAdd"){
        console.log(chalk.yellow("Now enter the search values:"));
        const search = await promptForKeyValuePairs();

        console.log(chalk.yellow("Now enter the new values (for update or add):"));
        const updateData = await promptForKeyValuePairs();

        console.log(chalk.yellow("Now enter the new values (for add only):"));
        const addData = await promptForKeyValuePairs();
        
        const updated = await updateOneOrAdd(selected, search, updateData, addData);
        console.log(chalk.green(updated ? "Data updated." : "Data added."));
    }
}

async function mainMenu(){
    let exit = false;
    init.init();

    while(!exit){
        try{
            exit = await mainMenuWindow() || false;
        }catch(err){
            console.error("\n", chalk.red("Error: "), err);
            exit = true;
        }
    }
}

export default mainMenu;