const inquirer = require('inquirer').default;
const DataBase = require('./database');
const chalk = require('chalk');
const ext = require('./ext');

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
                new inquirer.Separator(),
                
                'Select db',
                'Select list table',
                'Select text table',
                'Display tables',
                new inquirer.Separator(),
                
                'Update data',
                'Remove data',
                'Remove one data',
                'Update or Add data',
                new inquirer.Separator(),

                'Exit'
            ],
            loop: false
        },
    ]);

    if(operation === 'Exit'){
        console.log(chalk.blue('Exiting...'));
        return true;
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
        const choicesRaw = await selected.db.getDBs();
        const choices = await ext.process("list_table", selected.dbName, null, choicesRaw);

        const { table } = await inquirer.prompt([
            {
                type: 'list',
                name: 'table',
                message: 'Table:',
                choices: choices,
                loop: false
            },
        ]);
        selected.table = table;
        console.log(chalk.green('Table selected.'));
    }

    if(operation === 'Display tables'){
        if(!selected.db) return;
        const tables = await selected.db.getDBs();
        const extTables = await ext.process('display_table', selected.dbName, null, tables);
        console.log("\n", chalk.green('Tables:'), extTables, "\n");
    }

    if(!selected.db || !selected.table){
        return;
    }

    const { db, table } = selected;

    if(operation === 'Add data'){
        const data = await promptForKeyValuePairs();
        const extData = await ext.process('add', selected.dbName, selected.table, data);

        await db.add(table, extData);
        console.log(chalk.green('Data added:'), extData);
    }

    if(operation === 'Find data'){
        const search = await promptForKeyValuePairs();
        const results = await db.find(table, search);
        const extResults = await ext.process('find', selected.dbName, selected.table, results);

        console.log("\n", chalk.green('Found data:'), extResults, "\n");
    }
    
    if(operation === 'Find one data'){
        const search = await promptForKeyValuePairs();
        const result = await db.findOne(table, search);
        const extResult = await ext.process('findOne', selected.dbName, selected.table, result);

        console.log("\n", chalk.green('Found data:'), extResult, "\n");
    }

    if(operation === 'Update data'){
        const search = await promptForKeyValuePairs();
        console.log(chalk.yellow('Now enter the new values:'));
        const data = await promptForKeyValuePairs();
        const extData = await ext.process('update', selected.dbName, selected.table, { search, data });

        await db.update(table, extData.search, extData.data);
        console.log(chalk.green('Data updated.'));
    }

    if(operation === 'Update one data'){
        const search = await promptForKeyValuePairs();
        console.log(chalk.yellow('Now enter the new values:'));
        const data = await promptForKeyValuePairs();
        const extData = await ext.process('updateOne', selected.dbName, selected.table, { search, data });

        await db.updateOne(table, extData.search, extData.data);
        console.log(chalk.green('Data updated.'));
    }

    if(operation === 'Remove data'){
        const search = await promptForKeyValuePairs();
        const extSearch = await ext.process('remove', selected.dbName, selected.table, search);

        await db.remove(table, extSearch);
        console.log(chalk.green('Data removed.'));
    }

    if(operation === 'Remove one data'){
        const search = await promptForKeyValuePairs();
        const extSearch = await ext.process('removeOne', selected.dbName, selected.table, search);

        await db.removeOne(table, extSearch);
        console.log(chalk.green('Data removed.'));
    }

    if(operation === 'Update or Add data'){
        const search = await promptForKeyValuePairs();

        console.log(chalk.yellow('Now enter the new values (for update or add):'));
        const updateData = await promptForKeyValuePairs();

        console.log(chalk.yellow('Now enter the new values (for add only):'));
        const addData = await promptForKeyValuePairs();

        const extUpdateData = await ext.process('updateOrAdd', selected.dbName, selected.table, { search, updateData, addData });

        await db.updateOrAdd(table, extUpdateData.search, extUpdateData.updateData, extUpdateData.addData);
        console.log(chalk.green('Data updated or added.'));
    }
}

async function mainMenu(){
    let exit = false;
    loadDatabases();
    ext.load();

    while(!exit){
        exit = await mainMenuWindow() || false;
    }
}

module.exports = mainMenu;