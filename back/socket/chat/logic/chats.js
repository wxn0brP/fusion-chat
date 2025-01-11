import db from "../../../dataBase.js";
import { combinateId, createChat, exitChat, createPriv, addUserToChat } from "../../../logic/chatMgmt.js";
import valid from "../../../logic/validData.js";
import ValidError from "../../../logic/validError.js";

export async function realm_get(suser){
    const realms = await db.userData.find(suser._id, r => !!r.realm);
    if(realms.length == 0) return { err: false, res: [] };

    for(let i = 0; i < realms.length; i++){
        const realm = realms[i];
        const realmSet = await db.realmConf.findOne(realm.realm, { _id: 'set' });
        realm.img = realmSet.img || false;
    }

    return { err: false, res: realms };
}

export async function dm_get(suser){
    const privs = await db.userData.find(suser._id, { $exists: { priv: true } });
    if(privs.length == 0) return { err: false, res: [] };

    for(let i=0; i<privs.length; i++){
        const priv = privs[i];
        const id = combinateId(suser._id, priv.priv);
        const lastMess = await db.mess.find(id, {}, {}, { reverse: true, max: 1 });
        if(lastMess.length == 0) continue;
        priv.lastMessId = lastMess[0]._id;
    }

    return { err: false, res: privs };
}

export async function realm_create(suser, name){
    const validE = new ValidError("realm.create");
    if(!valid.str(name, 0, 30)) return validE.valid("name");

    createChat(name, suser._id);
    return { err: false };
}

export async function realm_exit(suser, id){
    const validE = new ValidError("realm.exit");
    if(!valid.id(id)) return validE.valid("id");

    await exitChat(id, suser._id);
    global.sendToSocket(suser._id, "refreshData", "realm.get");
    return { err: false };
}

export async function dm_create(suser, name){
    const validE = new ValidError("dm.create");
    if(!valid.str(name, 0, 30)) return validE.valid("name");

    const user = await db.data.findOne("user", { name });
    if(!user) return validE.err("user not found");

    const toId = user._id;

    const priv = await db.userData.findOne(suser._id, (r) => {
        if(!r.priv) return false;
        if(r.priv == toId) return true;
    });
    if(priv) return validE.err("already priv");

    await createPriv(toId, suser._id);

    global.sendToSocket(suser._id, "refreshData", "dm.get");
    global.sendToSocket(toId, "refreshData", "dm.get");

    return { err: false };
}

export async function realm_join(suser, id){
    const validE = new ValidError("realm.join");
    if(!valid.id(id)) return validE.valid("id");

    const exists = await db.userData.findOne(suser._id, { realm: id });
    if(exists) return validE.err("already in realm");

    const isBaned = await db.realmData.findOne(id, { ban: suser._id });
    if(isBaned) return validE.err("user is baned");
    
    await addUserToChat(id, suser._id);
    global.sendToSocket(suser._id, "refreshData", "realm.get");
    return { err: false };
}

export async function realm_mute(suser, id, time){
    const validE = new ValidError("realm.mute");
    if(!valid.id(id)) return validE.valid("id");
    if(!valid.num(time, -1)) return validE.valid("time");

    const exists = await db.userData.findOne(suser._id, { realm: id });
    if(!exists) return validE.err("not in realm");

    await db.userData.updateOne(suser._id, { realm: id }, { muted: time });
    return { err: false };
}

export async function dm_block(suser, id, blocked){
    const valid = new ValidError("dm.block");
    if(!valid.id(id)) return valid.valid("id"); 
    if(!valid.bool(blocked)) return valid.valid("blocked");

    await db.userData.updateOneOrAdd(suser._id, { priv: id }, { blocked });
    return { err: false };
}