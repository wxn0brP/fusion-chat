import valid from "../../logic/validData.js";
import permissionSystem from "../../logic/permission-system/index.js";
import processDbChanges from "../../logic/processDbChanges.js";
import { addCustom } from "../../logic/webhooks/index.js";
import setServerSettingsData from "./valid/setServerSettings.js";
import genId from "../../db/gen.js";
import * as emojiMgmt from "../../logic/emojiMgmt.js";
const setServerSettingsShema = valid.objAjv(setServerSettingsData);

export default (socket) => {
    socket.ontimeout("server.settings.get", 5_000, async (id, sections=[]) => {
        try{
            if(!socket.user) return socket.emit("error", "not auth");
            if(!valid.id(id)) return socket.emit("error.valid", "server.settings.get", "id");
            if(!valid.arrayString(sections)) return socket.emit("error.valid", "server.settings.get", "sections");

            if(sections.length == 0){
                sections = [
                    "meta",
                    "categories",
                    "channels",
                    "roles",
                    "users",
                    "banUsers",
                    "emojis",
                    "webhooks",
                ]
            }

            const perm = new permissionSystem(id);
            const userPerm = await perm.userPermison(socket.user._id, "manage server");
            if(!userPerm) return socket.emit("error", "You don't have permission to edit this server");

            let dbData;
            const getDbDataReq = ["meta", "categories", "channels", "roles", "banUsers", "emojis", "webhooks"];
            if(sections.some(d => getDbDataReq.includes(d))){
                dbData = await global.db.groupSettings.find(id, {});
            }
            const data = {};

            if(sections.includes("meta")){
                data.meta = dbData.find(d => d._id === "set");
                delete data.meta._id;
            }
            if(sections.includes("categories")) data.categories = dbData.filter(d => !!d.cid);
            if(sections.includes("channels")) data.channels = dbData.filter(d => !!d.chid);
            if(sections.includes("roles")) data.roles = dbData.filter(d => !!d.rid);
            if(sections.includes("emojis")) data.emojis = dbData.filter(d => !!d.unicode);
            if(sections.includes("webhooks")) data.webhooks = dbData.filter(d => !!d.whid);
            if(sections.includes("banUsers")) data.banUsers = dbData.filter(d => !!d.ban).map(u => u.ban);
            if(sections.includes("users")){
                const users = await global.db.usersPerms.find(id, d => !!d.uid);
                data.users = users.map(u => { return { uid: u.uid, roles: u.roles }});
            }

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

            let dbData;
            const sections = Object.keys(data);
            const getDbDataReq = ["meta", "categories", "channels", "roles", "banUsers", "emojis", "webhooks"];
            if(sections.some(d => getDbDataReq.includes(d))){
                dbData = await global.db.groupSettings.find(id, {});
            }

            if(data.meta) await global.db.groupSettings.updateOne(id, { _id: "set" }, data.meta);

            if(data.categories){
                const old_categories = dbData.filter(d => !!d.cid);
                const categoriesChanges = processDbChanges(old_categories, data.categories, ["name","i"], "cid");
                await saveDbChanges(id, categoriesChanges, "cid");
            }

            if(data.channels){
                const old_channels = dbData.filter(d => !!d.chid);
                const channelsChanges = processDbChanges(old_channels, data.channels, ["name","i","rp","desc"], "chid");
                await saveDbChanges(id, channelsChanges, "chid");
            }

            if(data.roles){
                const old_roles = dbData.filter(d => !!d.rid);
                const new_roles = processRolesIds(data.roles);
                const rolesChanges = processDbChanges(old_roles, new_roles, ["rid", "parent", "name", "color", "p"], "rid");
                await saveDbChanges(id, rolesChanges, "rid");
            }

            if(data.users){
                const old_users = await global.db.usersPerms.find(id, d => !!d.uid);
                const usersChanges = processDbChanges(old_users, data.users, ["uid", "roles"], "uid");
                for(const item of usersChanges.itemsToUpdate)
                    await global.db.usersPerms.update(id, (u, item) => u.uid == item.uid, item, item);
            }

            if(data.emojis){
                const old_emojis = dbData.filter(d => !!d.unicode);
                const emojisChanges = processDbChanges(old_emojis, data.emojis, ["name"], "unicode");
                await processEmojis(id, emojisChanges);
            }

            if(data.webhooks){
                const old_webhooks = dbData.filter(d => !!d.whid);
                const webhooksChanges = processDbChanges(old_webhooks, data.webhooks, ["name", "url"], "whid");
                await proccessWebhooks(id, webhooksChanges);
            }

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

async function proccessWebhooks(id, webhooksChanges){
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