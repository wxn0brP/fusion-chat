const DataBase = require("./database");

class Graph{
    constructor(folder){
        this.db = new DataBase(folder);
    }

    async add(collection, a, b){
        [a, b] = [a, b].sort();
        return await this.db.add(collection, { a, b }, false);
    }

    async remove(collection, a, b){
        [a, b] = [a, b].sort();
        return await this.db.removeOne(collection, { a, b });
    }
    
    async find(collection, d){
        const buffor = [];
        const a = await this.db.find(collection, { a: d });
        const b = await this.db.find(collection, { b: d });
        if(a) buffor.push(...a);
        if(b) buffor.push(...b);
        return buffor;
    }
}

module.exports = Graph;