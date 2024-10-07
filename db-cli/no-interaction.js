import init from "./init.js";
import { add, find, findOne, update, updateOne, remove, removeOne, updateOneOrAdd } from "./dbFunc.js";

const operationsInfo = {
    "dbSel": ["string"],
    "tabSel": ["string"],
    "add": ["object"],
    "find": ["object"],
    "findOne": ["object"],
    "update": ["object", "object"],
    "updateOne": ["object", "object"],
    "remove": ["object"],
    "removeOne": ["object"],
    "updateOneOrAdd": ["object", "object", "object"],
}

async function processOperationInfo(operations){
    const operation = operations.shift();
    const opInfo = operationsInfo[operation];
    if(!opInfo){
        throw new Error("Unknown operation: " + operation);
    }

    const args = operations.splice(0, opInfo.length);
    if(args.length != opInfo.length){
        throw new Error(
            `Not enough arguments for operation: ${operation} (required: ${opInfo.length})`
        );
    }

    for(let i=0; i<opInfo.length; i++){
        if(opInfo[i] === "object"){
            args[i] = JSON.parse(args[i]);
        }

        if(typeof args[i] !== opInfo[i]){
            throw new Error(
                `Wrong argument type for operation: ${operation} (required: ${opInfo[i]})`
            );
        }
    }

    return await processOperation(operation, args);
}

async function processOperation(operation, args){
    if(operation === "dbSel"){
        const dbName = args[0];
        selected.db = global.databases[dbName];
        if(!selected.db) throw new Error("Database not found: " + dbName);
        selected.dbName = dbName;
        return;
    }else
    if(operation === "tabSel"){
        const tableName = args[0];
        selected.table = tableName;
        return;
    }

    if(!selected.db || !selected.table){
        throw new Error("Not selected database or table");
    }

    if(operation === "add"){
        return await add(selected, ...args);
    }else
    if(operation === "find"){
        return await find(selected, ...args);
    }else
    if(operation === "findOne"){
        return await findOne(selected, ...args);
    }else
    if(operation === "update"){
        return await update(selected, ...args);
    }else
    if(operation === "updateOne"){
        return await updateOne(selected, ...args);
    }else
    if(operation === "remove"){
        return await remove(selected, ...args);
    }else
    if(operation === "removeOne"){
        return await removeOne(selected, ...args);
    }else
    if(operation === "updateOneOrAdd"){
        return await updateOneOrAdd(selected, ...args);
    }
}

export default async (operations) => {
    if(operations.length === 0) process.exit(3);
    init.init();

    let operationsLen = operations.length;
    while(operationsLen > 0){
        try{
            let res = await processOperationInfo(operations);
            if(res){
                if(typeof res === "object"){
                    res = JSON.stringify(res);
                }

                console.log(res);
            }
        }catch(e){
            console.error(e.message);
            process.exit(1);
        }
        operationsLen = operations.length;
    }

    process.exit(0);
}