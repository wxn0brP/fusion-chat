import { Router } from "express";
const router = Router();

router.post("/add", async (req, res) => {
    const { collection, a, b } = req.body;
    if(!collection || !a || !b) return res.status(400).json({ err: true, msg: "collection & a & b is required" });

    const db = req.dataCenter;
    try{
        const result = await db.add(collection, a, b);
        res.json({ err: false, result });
    }catch(err){
        res.status(500).json({ err: true, msg: err.message });
    }
});

router.post("/find", async (req, res) => {
    const { collection, node } = req.body;
    if(!collection || !node) return res.status(400).json({ err: true, msg: "collection & node is required" });

    const db = req.dataCenter;
    try{
        const result = await db.find(collection, node);
        res.json({ err: false, result });
    }catch(err){
        res.status(500).json({ err: true, msg: err.message });
    }
});

router.post("/findOne", async (req, res) => {
    const { collection, nodeA, nodeB } = req.body;
    if(!collection || !nodeA || !nodeB) return res.status(400).json({ err: true, msg: "collection & nodeA & nodeB is required" });

    const db = req.dataCenter;
    try{
        const result = await db.findOne(collection, nodeA, nodeB);
        res.json({ err: false, result });
    }catch(err){
        res.status(500).json({ err: true, msg: err.message });
    }
});

router.post("/remove", async (req, res) => {
    const { collection, nodeA, nodeB } = req.body;
    if(!collection || !nodeA || !nodeB) return res.status(400).json({ err: true, msg: "collection & nodeA & nodeB is required" });

    const db = req.dataCenter;
    try{
        const result = await db.remove(collection, nodeA, nodeB);
        res.json({ err: false, result });
    }catch(err){
        res.status(500).json({ err: true, msg: err.message });
    }
});

export default router;