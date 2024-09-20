const router = new require("express").Router();
const parseParam = require("./function");

router.post("/getDBs", (req, res) => {
    try{
        const db = req.dataCenter;
        const result = db.getDBs();
        res.json({ err: false, result });
    }catch(err){
        console.error(err);
        res.status(500).json({ err: true, msg: err.message });
    }
});

router.post("/checkCollection", (req, res) => {
    const { collection } = req.body;
    if(!collection) return res.status(400).json({ err: true, msg: "collection is required" });

    try{
        const db = req.dataCenter;
        db.checkCollection(collection);
        res.json({ err: false, result: true });
    }catch(err){
        console.error(err);
        res.status(500).json({ err: true, msg: err.message });
    }
});

router.post("/add", async (req, res) => {
    const { collection, data } = req.body;
    if(!collection || !data) return res.status(400).json({ err: true, msg: "collection & data is required" });

    try{
        const db = req.dataCenter;
        const result = await db.add(collection, data, req.body.id_gen || true);
        res.json({ err: false, result });
    }catch(err){
        console.error(err);
        res.status(500).json({ err: true, msg: err.message });
    }
});

router.post("/find", async (req, res) => {
    const { collection, search, context, options } = req.body;
    if(!collection || !search) return res.status(400).json({ err: true, msg: "collection & search is required" });

    try{
        const parsedSearch = parseParam(search);
        const db = req.dataCenter;
        const result = await db.find(collection, parsedSearch, context || {}, options);
        res.json({ err: false, result });
    }catch(err){
        console.error(err);
        res.status(500).json({ err: true, msg: err.message });
    }
});

router.post("/findOne", async (req, res) => {
    const { collection, search, context } = req.body;
    if(!collection || !search) return res.status(400).json({ err: true, msg: "collection & search is required" });

    try{
        const parsedSearch = parseParam(search);
        const db = req.dataCenter;
        const result = await db.findOne(collection, parsedSearch, context || {});
        res.json({ err: false, result });
    }catch(err){
        console.error(err);
        res.status(500).json({ err: true, msg: err.message });
    }
});

router.post("/update", async (req, res) => {
    const { collection, search, arg, context } = req.body;
    if(!collection || !search || !arg) return res.status(400).json({ err: true, msg: "collection & search & arg is required" });

    try{
        const parsedSearch = parseParam(search);
        const parsedArg = parseParam(arg);
        const db = req.dataCenter;
        const result = await db.update(collection, parsedSearch, parsedArg, context || {});
        res.json({ err: false, result });
    }catch(err){
        console.error(err);
        res.status(500).json({ err: true, msg: err.message });
    }
});

router.post("/updateOne", async (req, res) => {
    const { collection, search, arg, context } = req.body;
    if(!collection || !search || !arg) return res.status(400).json({ err: true, msg: "collection & search & arg is required" });

    try{
        const parsedSearch = parseParam(search);
        const parsedArg = parseParam(arg);
        const db = req.dataCenter;
        const result = await db.updateOne(collection, parsedSearch, parsedArg, context || {});
        res.json({ err: false, result });
    }catch(err){
        console.error(err);
        res.status(500).json({ err: true, msg: err.message });
    }
});

router.post("/remove", async (req, res) => {
    const { collection, search, context } = req.body;
    if(!collection || !search) return res.status(400).json({ err: true, msg: "collection & search is required" });

    try{
        const parsedSearch = parseParam(search);
        const db = req.dataCenter;
        const result = await db.remove(collection, parsedSearch, context || {});
        res.json({ err: false, result });
    }catch(err){
        console.error(err);
        res.status(500).json({ err: true, msg: err.message });
    }
});

router.post("/removeOne", async (req, res) => {
    const { collection, search, context } = req.body;
    if(!collection || !search) return res.status(400).json({ err: true, msg: "collection & search is required" });

    try{
        const parsedSearch = parseParam(search);
        const db = req.dataCenter;
        const result = await db.removeOne(collection, parsedSearch, context || {});
        res.json({ err: false, result });
    }catch(err){
        console.error(err);
        res.status(500).json({ err: true, msg: err.message });
    }
});

router.post("/updateOneOrAdd", async (req, res) => {
    const { collection, search, arg, add_arg, context, id_gen } = req.body;
    if(!collection || !search || !arg) return res.status(400).json({ err: true, msg: "collection & search & arg is required" });

    try{
        const parsedSearch = parseParam(search);
        const parsedArg = parseParam(arg);
        const parsedAddArg = parseParam(add_arg);
        const db = req.dataCenter;
        const result = await db.updateOneOrAdd(collection, parsedSearch, parsedArg, parsedAddArg || {}, context || {}, id_gen || true);
        res.json({ err: false, result });
    }catch(err){
        console.error(err);
        res.status(500).json({ err: true, msg: err.message });
    }
});

router.post("/removeDb", async (req, res) => {
    const { name } = req.body;
    if(!name) return res.status(400).json({ err: true, msg: "name is required" });

    try{
        const db = req.dataCenter;
        const result = await db.removeDb(name);
        res.json({ err: false, result });
    }catch(err){
        console.error(err);
        res.status(500).json({ err: true, msg: err.message });
    }
});

module.exports = router;