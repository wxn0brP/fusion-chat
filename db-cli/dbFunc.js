const ext = require("./ext");

async function add(database, data){
    const { db, dbName, table } = database;
    const extData = await ext.process("add", dbName, table, data);
    return await db.add(table, extData);
}

async function find(database, search){
    const { db, dbName, table } = database;
    const extSearch = await ext.process("find", dbName, table, search);
    return await db.find(table, extSearch);
}

async function findOne(database, search){
    const { db, dbName, table } = database;
    const extSearch = await ext.process("findOne", dbName, table, search);
    return await db.findOne(table, extSearch);
}

async function update(database, search, data){
    const { db, dbName, table } = database;
    const extData = await ext.process("update", dbName, table, { search, data });
    return await db.update(table, extData.search, extData.data);
}

async function updateOne(database, search, data){
    const { db, dbName, table } = database;
    const extData = await ext.process("updateOne", dbName, table, { search, data });
    return await db.updateOne(table, extData.search, extData.data);
}

async function remove(database, search){
    const { db, dbName, table } = database;
    const extSearch = await ext.process("remove", dbName, table, search);
    return await db.remove(table, extSearch);
}

async function removeOne(database, search){
    const { db, dbName, table } = database;
    const extSearch = await ext.process("removeOne", dbName, table, search);
    return await db.removeOne(table, extSearch);
}

async function updateOneOrAdd(database, search, data, addData){
    const { db, dbName, table } = database;
    const extData = await ext.process("updateOneOrAdd", dbName, table, { search, data, addData });
    return await db.updateOneOrAdd(table, extData.search, extData.data, extData.addData);
}

module.exports = {
    add,
    find,
    findOne,
    update,
    updateOne,
    remove,
    removeOne,
    updateOneOrAdd
}