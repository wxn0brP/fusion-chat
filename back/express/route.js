import { readdirSync, readFileSync } from "fs";
import { Router } from "express";
import { minify } from "html-minifier";

const frontRouter = Router();
const apiRouter = Router();
app.use("/", frontRouter);
app.use("/api", apiRouter);

function minifity(body){
    return minify(body, {
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

const apiPath = "./back/express/api/";
readdirSync(apiPath).filter(file => file.includes(".js")).forEach(async file => {
    const router = await import("./api/"+file);
    apiRouter.use("/", router.default);
});

readdirSync("front/public").filter(file => file.includes(".html")).forEach(file => {
    frontRouter.get("/"+file.replace(".html", ""), (req, res) => {
        let data = readFileSync("front/public/"+file, "utf-8");
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
    try{
        res.render("app/app");
    }catch(err){
        console.error(err);
        res.status(500).send("Internal Server Error");
    }
});

frontRouter.get("/", (req, res) => {
    try{
        renderLayout(res, "layout/main", "main/index", {}, {});
    }catch(err){
        console.error(err);
        res.status(500).send("Internal Server Error");
    }
});

readdirSync("front/main").filter(file => file.includes(".ejs")).map(file => file.replace(".ejs", "")).forEach(site => {
    frontRouter.get("/"+site, (req, res) => {
        try{
            renderLayout(res, "layout/main", "main/"+site, {}, {});
        }catch(err){
            console.error(err);
            res.status(500).send("Internal Server Error");
        }
    })
});