const DataBase = require("./database");

class Graph{
    constructor(folder){
        this.db = new DataBase(folder, 3, 300_000);
        this.dbAction = this.db.dbAction;
    }

    async addNode(node, id1, id2){
        [id1, id2] = [id1, id2].sort();
        return await this.dbAction.add(node, { a: id1, b: id2}, false);
    }

    async rmNode(node, id1, id2){
        [id1, id2] = [id1, id2].sort();
        return await this.db.removeOne(node, { a: id1, b: id2 });
    }
    
    async getNodes(node, id1){
        const buffor = [];
        const a = await this.db.find(node, { a: id1 });
        const b = await this.db.find(node, { b: id1 });
        if(a) buffor.concat(a);
        if(b) buffor.concat(b);
        return buffor;
    }
}

module.exports = Graph;