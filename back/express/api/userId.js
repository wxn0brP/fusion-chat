const router = require("express").Router();
const valid = require("../../logic/validData");

async function getUserName(id, user){
    if(!user) user = await global.db.data.findOne("user", { _id: id });
    if(!user) return;
    const nick = await global.db.userDatas.findOne(id, (d) => !!d.nick);
    return nick ? nick.nick : user.name;
}

async function getWebhookName(id, chat){
    const webhook = await global.db.groupSettings.findOne(chat, { whid: id });
    return webhook ? webhook.name : null;
}

async function getChatUserName(id, chat){
    const userData = await global.db.groupData.findOne(chat, { uid: id });
    return userData ? userData.name : null;
}

router.get("/userId", async (req, res) => {
    const { user: id, chat } = req.query;
    if(!valid.id(id)) return res.json({ err: true, msg: "user is not valid" });
    if(chat && !valid.id(chat)) return res.json({ err: true, msg: "chat is not valid" });

    if(chat){
        const webhook = await getWebhookName(id, chat);
        if(webhook) return res.json({ err: false, name: webhook+" (APP)" });
    }

    const user = await global.db.data.findOne("user", { _id: id });
    if(!user)
        return res.json({ err: true, msg: "user is not found" });

    if(!chat)
        return res.json({ err: false, name: await getUserName(id, user) });

    const serverName = await getChatUserName(id, chat);
    const userName = await getUserName(id, user);
    res.json({ err: false, name: serverName || userName, isServer: !!serverName });
});

module.exports = router;