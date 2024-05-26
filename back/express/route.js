const fs = require("fs");
const path = __dirname + "/route/";

fs.readdirSync(path).forEach(file => require(path+file));

fs.readdirSync(global.dir+"../front/public").filter(file => file.includes(".html")).forEach(file => {
    app.get("/"+file.replace(".html", ""), (req, res) => {
        res.send(fs.readFileSync(global.dir+"../front/public/"+file, "utf-8"));
    })
})