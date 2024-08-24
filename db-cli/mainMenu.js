const inquirer = require('inquirer').default;
const DataBase = require('./database');
const chalk = require('chalk');

const selected = {
    db: null,
    dbName: null,
    table: null
}

global.databases = {};

function loadDatabases(){
    const dbNames = Object.keys(dbConfig);
    for(const dbName of dbNames){
        databases[dbName] = new DataBase(dbConfig[dbName]);
    }
}

async function selectDatabase(){
    const dbNames = Object.keys(dbConfig);
    if(dbNames.length === 0){
        console.log(chalk.red('No databases found. Add a database first.'));
        process.exit(1);
    }

    const { selectedDb } = await inquirer.prompt([
        {
            type: 'list',
            name: 'selectedDb',
            message: 'Select a database:',
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
            { name: 'key', message: 'Key:' },
            { name: 'value', message: 'Value:', when: (answers) => answers.key !== '' },
        ]);

        if(key === '') break;
        data[key] = value;
    }

    return data;
}

async function mainMenuWindow(){
    console.log(chalk.green('Selected database:'), selected.dbName);
    console.log(chalk.green('Selected table:'), selected.table);

    const { operation } = await inquirer.prompt([
        {
            type: 'list',
            name: 'operation',
            message: 'Choose an operation:',
            choices: [
                'Find one data',
                'Find data',
                'Update one data',
                'Add data',
                "---",
                
                'Select db',
                'Select list table',
                'Select text table',
                'Display tables',
                "---",
                
                'Update data',
                'Remove data',
                'Remove one data',
                'Update or Add data',
                "---",

                'Exit'
            ],
            loop: false
        },
    ]);

    if(operation === 'Exit'){
        console.log(chalk.blue('Exiting...'));
        return true;
    }

    if(operation === "---"){
        return;
    }

    if(operation === 'Select db'){
        const dbName = await selectDatabase();
        selected.db = global.databases[dbName];
        selected.dbName = dbName;
        console.log(chalk.green('Database selected.'));
    }

    if(operation === 'Select text table'){
        const { table } = await inquirer.prompt([
            { name: 'table', message: 'Table:' },
        ]);
        selected.table = table;
        console.log(chalk.green('Table selected.'));
    }

    if(operation === 'Select list table'){
        if(!selected.db) return;
        const { table } = await inquirer.prompt([
            {
                type: 'list',
                name: 'table',
                message: 'Table:',
                choices: await selected.db.getDBs(),
                loop: false
            },
        ]);
        selected.table = table;
        console.log(chalk.green('Table selected.'));
    }

    if(operation === 'Display tables'){
        if(!selected.db) return;
        const tables = await selected.db.getDBs();
        console.log(chalk.green('Tables:'), tables);
    }

    if(!selected.db || !selected.table){
        return;
    }

    const { db, table } = selected;

    if(operation === 'Add data'){
        const data = await promptForKeyValuePairs();
        await db.add(table, data);
        console.log(chalk.green('Data added:'), data);
    }

    if(operation === 'Find data'){
        const search = await promptForKeyValuePairs();
        const results = await db.find(table, search);
        console.log("\n", chalk.green('Found data:'), results, "\n");
    }

    if(operation === 'Find one data'){
        const search = await promptForKeyValuePairs();
        const result = await db.findOne(table, search);
        console.log("\n", chalk.green('Found data:'), result, "\n");
    }

    if(operation === 'Update data'){
        const search = await promptForKeyValuePairs();
        console.log(chalk.yellow('Now enter the new values:'));
        const data = await promptForKeyValuePairs();
        await db.update(table, search, data);
        console.log(chalk.green('Data updated.'));
    }

    if(operation === 'Update one data'){
        const search = await promptForKeyValuePairs();
        console.log(chalk.yellow('Now enter the new values:'));
        const data = await promptForKeyValuePairs();
        await db.updateOne(table, search, data);
        console.log(chalk.green('Data updated.'));
    }

    if(operation === 'Remove data'){
        const search = await promptForKeyValuePairs();
        await db.remove(table, search);
        console.log(chalk.green('Data removed.'));
    }

    if(operation === 'Remove one data'){
        const search = await promptForKeyValuePairs();
        await db.removeOne(table, search);
        console.log(chalk.green('Data removed.'));
    }

    if(operation === 'Update or Add data'){
        const search = await promptForKeyValuePairs();
        console.log(chalk.yellow('Now enter the new values (for update or add):'));
        const updateData = await promptForKeyValuePairs();
        console.log(chalk.yellow('Now enter the new values (for add only):'));
        const addData = await promptForKeyValuePairs();
        await db.updateOneOrAdd(table, search, updateData, addData);
        console.log(chalk.green('Data updated or added.'));
    }
}

async function mainMenu(){
    let exit = false;
    loadDatabases();

    while(!exit){
        exit = await mainMenuWindow() || false;
    }
}

module.exports = mainMenu;