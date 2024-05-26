const databaseC = require("../");

const db = new databaseC("./test");

(async () => {

    // for add to db
    // for (let x = 0; x < 500000; x++) {
    // await db.add("test", {a: x, b: x});
    // }

    const data = await db.find("test", {}, {
        // max: 5,
        // reverse: true
    });
    console.log(data);
})();