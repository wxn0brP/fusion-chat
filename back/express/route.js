const fs = require("fs");
const path = __dirname + "/route/";
const express = require("express");
const router = express.Router();
const htmlMinifier = require("html-minifier");
app.use("/", router);

function minifity(body){
    return htmlMinifier.minify(body, {
        collapseWhitespace: true,
        minifyCSS: true,
        minifyJS: true,
        removeComments: true,
        removeRedundantAttributes: true,
        removeScriptTypeAttributes: true,
        removeStyleLinkTypeAttributes: true,
        useShortDoctype: true
    });
}

fs.readdirSync(path).forEach(file => require(path+file));

fs.readdirSync(global.dir+"../front/public").filter(file => file.includes(".html")).forEach(file => {
    router.get("/"+file.replace(".html", ""), (req, res) => {
        let data = fs.readFileSync(global.dir+"../front/public/"+file, "utf-8");
        res.send(minifity(data));
    })
});

async function renderLayout(res, layout, bodyPath, layoutData, bodyData){
    res.render(bodyPath, bodyData, (err, body) => {
        if(err) throw err;

        if(body && body.startsWith("///")){
            const bs = body.split("\n");
            const data = JSON.parse(bs[0].replace("///", ""));
            layoutData = {...layoutData, ...data};

            body = bs.slice(1).join("\n");
        }

        res.render(layout, { layout: layoutData, body, }, (err, body) => {
            if(err) throw err;
            res.send(minifity(body));
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