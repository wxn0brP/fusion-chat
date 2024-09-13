const router = require("express").Router();

router.get("/userId", async (req, res) => {
    const { user } = req.query;
    if(!user) return res.json({
        err: true, msg: "user is required"
    });

    const toId = await global.db.data.findOne("user", { _id: user });
    if(!toId) return res.json({
        err: true, msg: "user is not found"
    });
    res.json({
        err: false, msg: toId.name
    });
});

module.exports = router;