app.get("/chatId", async (req, res) => {
    const { chat } = req.query;
    if(!chat) return res.json({
        err: true, msg: "chatId is required"
    });

    const chatI = await global.db.groupSettings.findOne(chat, { _id: "set" });
    if(!chatI) return res.json({
        err: true, msg: "chatId is not found"
    });

    const chatName = chatI.name;

    res.json({
        err: false, msg: chatName
    });
});