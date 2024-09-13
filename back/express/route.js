const fs = require("fs");
const express = require("express");
const htmlMinifier = require("html-minifier");

const frontRouter = express.Router();
const apiRouter = express.Router();
app.use("/", frontRouter);
app.use("/api", apiRouter);

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

fs.readdirSync(__dirname+"/api").filter(file => file.includes(".js")).forEach(file => {
    const router = require("./api/"+file);
    apiRouter.use("/", router);
});

fs.readdirSync(global.dir+"../front/public").filter(file => file.includes(".html")).forEach(file => {
    frontRouter.get("/"+file.replace(".html", ""), (req, res) => {
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

frontRouter.get("/app", (req, res) => {
    res.render("app/app");
});

frontRouter.get("/", (req, res) => {
    renderLayout(res, "layout/main", "main/index", {}, {})
});

fs.readdirSync(global.dir+"../front/main").filter(file => file.includes(".ejs")).map(file => file.replace(".ejs", "")).forEach(site => {
    frontRouter.get("/"+site, (req, res) => {
        renderLayout(res, "layout/main", "main/"+site, {}, {});
    })
});