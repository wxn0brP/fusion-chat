import { combinateId, createChat, exitChat, createPriv, addUserToChat } from "../../../logic/chatMgmt.js";
import valid from "../../../logic/validData.js";
import ValidError from "../../../logic/validError.js";

export async function group_get(suser){
    const groups = await global.db.userDatas.find(suser._id, r => !!r.group);
    if(groups.length == 0) return { err: false, res: [] };

    for(let i = 0; i < groups.length; i++){
        const group = groups[i];
        const serverSet = await global.db.groupSettings.findOne(group.group, { _id: 'set' });
        group.img = serverSet.img || false;
    }

    return { err: false, res: groups };
}

export async function private_get(suser){
    const privs = await global.db.userDatas.find(suser._id, { $exists: { priv: true } });
    if(privs.length == 0) return { err: false, res: [] };

    for(let i=0; i<privs.length; i++){
        const priv = privs[i];
        const id = combinateId(suser._id, priv.priv);
        const lastMess = await global.db.mess.find(id, {}, {}, { reverse: true, max: 1 });
        if(lastMess.length == 0) continue;
        priv.lastMessId = lastMess[0]._id;
    }

    return { err: false, res: privs };
}

export async function group_create(suser, name){
    const validE = new ValidError("group.create");
    if(!valid.str(name, 0, 30)) return validE.valid("name");

    createChat(name, suser._id);
    return { err: false };
}

export async function group_exit(suser, id){
    const validE = new ValidError("group.exit");
    if(!valid.id(id)) return validE.valid("id");

    await exitChat(id, suser._id);
    global.sendToSocket(suser._id, "refreshData", "group.get");
    return { err: false };
}

export async function private_create(suser, name){
    const validE = new ValidError("private.create");
    if(!valid.str(name, 0, 30)) return validE.valid("name");

    const user = await global.db.data.findOne("user", { name });
    if(!user) return validE.err("user not found");

    const toId = user._id;

    const priv = await global.db.userDatas.findOne(suser._id, (r) => {
        if(!r.priv) return false;
        if(r.priv == toId) return true;
    });
    if(priv) return validE.err("already priv");

    await createPriv(toId, suser._id);

    global.sendToSocket(suser._id, "refreshData", "private.get");
    global.sendToSocket(toId, "refreshData", "private.get");

    return { err: false };
}

export async function group_join(suser, id){
    const validE = new ValidError("group.join");
    if(!valid.id(id)) return validE.valid("id");

    const exists = await global.db.userDatas.findOne(suser._id, { group: id });
    if(exists) return validE.err("already in group");

    const isBaned = await global.db.usersPerms.findOne(id, { ban: suser._id });
    if(isBaned) return validE.err("user is baned");
    
    await addUserToChat(id, suser._id);
    global.sendToSocket(suser._id, "refreshData", "group.get");
    return { err: false };
}

export async function group_mute(suser, id, time){
    const validE = new ValidError("group.mute");
    if(!valid.id(id)) return validE.valid("id");
    if(!valid.num(time, -1)) return validE.valid("time");

    const exists = await global.db.userDatas.findOne(suser._id, { group: id });
    if(!exists) return validE.err("not in group");

    await global.db.userDatas.updateOne(suser._id, { group: id }, { muted: time });
    return { err: false };
}

export async function private_block(suser, id, blocked){
    const valid = new ValidError("private.block");
    if(!valid.id(id)) return valid.valid("id"); 
    if(!valid.bool(blocked)) return valid.valid("blocked");

    await global.db.userDatas.updateOneOrAdd(suser._id, { priv: id }, { blocked });
    return { err: false };
}