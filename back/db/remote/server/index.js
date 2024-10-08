import express from "express";
import bodyParser from "body-parser";
import { authMiddleware } from "./auth.js";
import dbRouter from "./db.js";
import graphRouter from "./graph.js";
import "./initDataBases.js";

const port = process.env.PORT || 14785;
global.baseDir = process.env.baseDir || process.cwd();
console.log("baseDir", baseDir);
global.app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

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

mainRouter.use("/database", dbRouter);
mainRouter.use("/graph", graphRouter);

app.use(mainRouter);
app.listen(port, () => console.log(`Server started on port ${port}`));