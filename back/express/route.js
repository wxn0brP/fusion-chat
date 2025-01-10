import { readdirSync, readFileSync } from "fs";
import { Router } from "express";
import { minify } from "html-minifier";

const frontRouter = Router();
const apiRouter = Router();
app.use("/", frontRouter);
app.use("/api", apiRouter);

function minifyHtml(body){
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

function sendInternalError(res, err){
    console.error(err);
    res.status(500).send("Internal Server Error");
}

function error500(cb){
    return async (req, res, next) => {
        try{
            await cb(req, res, next);
        }catch(err){
            sendInternalError(res, err);
        }
    }
}    

const apiPath = "./back/express/api/";
readdirSync(apiPath).filter(file => file.includes(".js")).forEach(async file => {
    const routerImport = await import("./api/"+file);
    let { path, default: router } = routerImport;

    if(!path) path = "";
    
    apiRouter.use("/"+path, router);
});

readdirSync("front/public").filter(file => file.includes(".html")).forEach(file => {
    frontRouter.get("/"+file.replace(".html", ""), (req, res) => {
        const data = readFileSync("front/public/"+file, "utf-8");
        res.send(minifyHtml(data));
    })
});

async function renderLayout(res, layout, bodyPath, layoutData, bodyData){
    res.render(bodyPath, bodyData, (err, body) => {
        if(err)
            return sendInternalError(res, err);

        if(body && body.startsWith("///")){
            const bs = body.split("\n");
            const data = JSON.parse(bs[0].replace("///", ""));
            layoutData = {...layoutData, ...data};

            body = bs.slice(1).join("\n");
        }

        res.render(layout, { layout: layoutData, body, }, (err, body) => {
            if(err)
                return sendInternalError(res, err);
            res.send(minifyHtml(body));
        });
    });
}

frontRouter.get("/app", error500((req, res) => {
    res.render("app/app", (err, body) => {
        if(err)
            return sendInternalError(res, err);
        const html = process.env.status == "dev" ? body : minifyHtml(body);
        res.send(html);
    })
}));

frontRouter.get("/", error500((req, res) => renderLayout(res, "layout/main", "main/index", {}, {})));
frontRouter.get("/dev-panel", error500((req, res) => renderLayout(res, "layout/main", "dev-panel/dev-panel", {}, {})));

readdirSync("front/main", { recursive: true })
    .filter(file => file.includes(".ejs"))
    .map(file => file.replace(".ejs", ""))
    .forEach(site => {
        frontRouter.get("/"+site, (req, res) => {
            try{
                renderLayout(res, "layout/main", "main/"+site, {}, {});
            }catch(err){
                sendInternalError(res, err);
            }
        })
    });


