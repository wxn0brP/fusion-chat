const fs = require("fs");
const path = __dirname + "/route/";
const express = require("express");
const router = express.Router();
app.use("/", router);

fs.readdirSync(path).forEach(file => require(path+file));

fs.readdirSync(global.dir+"../front/public").filter(file => file.includes(".html")).forEach(file => {
    app.get("/"+file.replace(".html", ""), (req, res) => {
        res.send(fs.readFileSync(global.dir+"../front/public/"+file, "utf-8"));
    })
});

async function renderLayout(res, layout, bodyPath, layoutData, bodyData){
    res.render(bodyPath, bodyData, (err, body) => {
        if(err) throw err;
        res.render(layout, {
            layout: layoutData,
            body
        });
    });
}

router.get("/app", (req, res) => {
    res.render("app/app");
});

router.get("/", (req, res) => {
    renderLayout(res, "layout/main", "main/index", {}, {})
});

fs.readdirSync(global.dir+"../front/main").filter(file => file.includes(".ejs")).map(file => file.replace(".ejs", "")).forEach(site => {
    router.get("/"+site, (req, res) => {
        renderLayout(res, "layout/main", "main/"+site, {}, {});
    })
});