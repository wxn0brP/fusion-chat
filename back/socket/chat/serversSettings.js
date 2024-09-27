import valid from "../../logic/validData.js";
import permissionSystem from "../../logic/permission-system/index.js";
import processDbChanges from "../../logic/processDbChanges.js";
import { addCustom } from "../../logic/webhooks/index.js";
import serServerSettingsData from "./valid/setServerSettings.js";
import genId from "../../db/gen.js";
import * as emojiMgmt from "../../logic/emojiMgmt.js";
const setServerSettingsShema = valid.objAjv(serServerSettingsData);

export default (socket) => {
    socket.ontimeout("server.settings.get", 5_000, async (id) => {
        try{
            if(!socket.user) return socket.emit("error", "not auth");
            if(!valid.id(id)) return socket.emit("error.valid", "server.settings.get", "id");

            const perm = new permissionSystem(id);
            const userPerm = await perm.userPermison(socket.user._id, "manage server");
            if(!userPerm) return socket.emit("error", "You don't have permission to edit this server");

            const meta = await global.db.groupSettings.findOne(id, { _id: "set" });
            delete meta._id;
            const categories = await global.db.groupSettings.find(id, (r) => !!r.cid);
            const channels = await global.db.groupSettings.find(id, (r) => !!r.chid);
            const roles = await perm.getRoles();
            const users = await global.db.usersPerms.find(id, (u) => !!u.uid);
            const banUsers = await global.db.usersPerms.find(id, (u) => !!u.ban);
            const emojis = await global.db.groupSettings.find(id, (e) => !!e.unicode);
            const webhooks = await global.db.groupSettings.find(id, (w) => !!w.whid);

            const data = {
                meta,
                categories,
                channels,
                roles,
                users: users.map(u => { return { uid: u.uid, roles: u.roles }}),
                banUsers: banUsers.map(u => u.ban),
                emojis,
                webhooks,
            };

            socket.emit("server.settings.get", data, id);
        }catch(e){
            socket.logError(e);
        }
    });

    socket.ontimeout("server.settings.set", 5_000, async (id, data) => {
        try{
            if(!socket.user) return socket.emit("error", "not auth");
            if(!valid.id(id)) return socket.emit("error.valid", "server.settings.set", "id");

            const perm = new permissionSystem(id);
            const userPerm = await perm.userPermison(socket.user._id, "manage server");
            if(!userPerm) return socket.emit("error", "You don't have permission to edit this server");

            if(!setServerSettingsShema(data)){
                lo(setServerSettingsShema.errors);
                lo(data)
                return socket.emit("error.valid", "server.settings.set", "data", setServerSettingsShema.errors);
            }

            const o_categories = await global.db.groupSettings.find(id, (c) => !!c.cid);
            const o_channels = await global.db.groupSettings.find(id, (c) => !!c.chid);
            const o_roles = await perm.getRoles();
            const o_users = await global.db.usersPerms.find(id, (u) => !!u.uid);
            const o_emojis = await global.db.groupSettings.find(id, (e) => !!e.unicode);
            const o_webhooks = await global.db.groupSettings.find(id, (w) => !!w.whid);

            const pcaci = processCategoriesAndChannelIds(data.categories, data.channels);
            const n_roles = processRolesIds(data.roles);

            const categoriesChanges = processDbChanges(o_categories, pcaci.categories, ["name","i"], "cid");
            const channelsChanges = processDbChanges(o_channels, pcaci.channels, ["name","i","rp","desc"], "chid");
            const rolesChanges = processDbChanges(o_roles, n_roles, ["rid", "parent", "name", "color", "p"], "rid");
            const usersChanges = processDbChanges(o_users, data.users, ["uid", "roles"], "uid");
            const emojisChanges = processDbChanges(o_emojis, data.emojis, ["name"], "unicode");
            const webhooksChanges = processDbChanges(o_webhooks, data.webhooks, ["name", "chnl", "tamplate", "required", "ajv","embed"], "whid");

            await saveDbChanges(id, categoriesChanges, "cid");
            await saveDbChanges(id, channelsChanges, "chid");
            await saveDbChanges(id, rolesChanges, "rid");
            for(const item of usersChanges.itemsToUpdate)
                await global.db.usersPerms.update(id, (u, item) => u.uid == item.uid, item, item);
            await saveDbChanges(id, emojisChanges, "unicode");

            await processEmojis(id, emojisChanges);
            await proccesWebhooks(id, webhooksChanges);

            await global.db.groupSettings.updateOne(id, { _id: "set" }, data.meta);

            global.sendToChatUsers(id, "refreshData", { server: id, evt: ["server.setup", "server.roles.sync"] }, id);
        }catch(e){
            socket.logError(e);
        }
    });
}

async function saveDbChanges(doc, changes, idName="_id"){
    const { itemsToAdd, itemsToRemove, itemsToUpdate, itemsWithRemovedFields } = changes;
    const db = global.db.groupSettings.c(doc);

    for(const item of itemsToAdd)
        await db.add(item, false);

    for(const item of itemsToRemove){
        await db.remove(
            (item, ctx) => item[ctx.idName] == ctx.item[ctx.idName],
            { item, idName }
        );
    }
    
    for(const item of itemsToUpdate){
        await db.update(
            (item, ctx) => item[ctx.idName] == ctx.item[ctx.idName],
            item,
            { item, idName }
        );
    }

    for(const item of itemsWithRemovedFields){
        await db.update(
            (item, ctx) => item[ctx.idName] == ctx.item[ctx.idName],
            (item, ctx) => {
                for(const deletedParam of ctx.item.deletedParams) delete item[deletedParam];
                return item;
            },
            { item, idName }
        );
    }
}

function processCategoriesAndChannelIds(categories, channels){
    for(let i=0; i<categories.length; i++){
        const category = categories[i];
        if(typeof category.cid == "number"){
            const newId = genId();

            const childChannels = channels.filter(c => c.category == category.cid);
            childChannels.forEach(c => c.category = newId);
            categories[i].cid = newId;
        }
    }

    for(let i=0; i<channels.length; i++){
        const channel = channels[i];
        if(typeof channel.chid == "number" || channel.chid == undefined){
            channels[i].chid = genId();
        }
    }

    return { categories, channels };
}

function processRolesIds(roles){
    for(let i=0; i<roles.length; i++){
        const role = roles[i];
        if(typeof role.rid == "number"){
            const newId = genId();
            
            const childRole = roles.find(r => r.parent == role.rid);
            if(childRole) childRole.parent = newId;
            roles[i].rid = newId;
        }
    }

    return roles;
}

async function processEmojis(id, emojisChanges){
    const isEmojisChanged =
        emojisChanges.itemsToAdd.length > 0 || emojisChanges.itemsToRemove.length > 0 || emojisChanges.itemsToUpdate.length > 0;

    if(isEmojisChanged){
        const emojis = await global.db.groupSettings.find(id, (e) => !!e.unicode);
        await emojiMgmt.createFont(emojis, id);
    }

    const basePath = "userFiles/servers/" + id + "/emoji/";
    for(const rmEmoji of emojisChanges.itemsToRemove){
        const path = basePath + rmEmoji.unicode.toString(16) + ".svg";
        if(fs.existsSync(path)){
            fs.unlinkSync(path);
        }
    }
}

async function proccesWebhooks(id, webhooksChanges){
    const itemsToAdd = [...webhooksChanges.itemsToAdd];
    webhooksChanges.itemsToAdd = [];
    await saveDbChanges(id, webhooksChanges, "whid");

    for(const item of itemsToAdd){
        const webhookInfo = {
            name: item.name,
            chat: id,
            chnl: item.chnl,
            template: item.template,
            
            require: item.require || [],
            ajv: item.ajv || {},
        }
        await addCustom(webhookInfo);
    }
}