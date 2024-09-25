import express from "express";
import bodyParser from "body-parser";
import DataBase from "../../database.js";
import Graph from "../../graph.js";
import { authMiddleware } from "./auth.js";

const port = process.env.PORT || 14785;
global.app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

global.dataCenter = {};

global.db = new DataBase("./serverDB");

const mainRouter = express.Router();
mainRouter.use(authMiddleware);
mainRouter.use(checkRequest);

function checkRequest(req, res, next){
    const dbName = req.body.db;

    if(!dataCenter[dbName]){
        return res.status(400).json({ err: true, msg: "Invalid data center." });
    }

    req.dataCenter = dataCenter[dbName];

    next();
}

app.post("/register", authMiddleware, async (req, res) => {
    const { name, path, type } = req.body;

    if(!name || !path || !type){
        return res.status(400).json({ err: true, msg: "name & path & type are required" });
    }

    if(dataCenter[name]){
        return res.json({ err: false, dataCenter: name, msg: "Data center already exists." });
    }

    const options = req.body.options || {};

    switch(type){
        case "database":
            dataCenter[name] = new DataBase(path, options);
            break;
        case "graph":
            dataCenter[name] = new Graph(path, options);
            break;
        default:
            return res.status(400).json({ err: true, msg: "Invalid type." });
    }

    return res.json({ err: false, dataCenter: name });
});

mainRouter.use("/database", (await import("./db.js")).default);
mainRouter.use("/graph", (await import("./graph.js")).default);

app.use(mainRouter);
app.listen(port, () => console.log(`Server started on port ${port}`));