import { genId } from "@wxn0brp/db";
import PermissionSystem from "./permission-system/index";
import Permissions, { getAllPermissions } from "./permission-system/permission";
import db from "#db";
import Id from "#id";

/**
 * A function to combine two user ids into a new chat id.
 *
 * @param id_1 - The first user id
 * @param id_2 - The second user id
 * @return The combined chat id
 */
export function combineId(id_1: Id, id_2: Id): Id{
    const [id1, id2] = [id_1, id_2].sort();

    // Extract prefixes from user ids
    const p1 = id1.split("-")[0];
    const p2 = id2.split("-")[0];

    // Function to mix user ids
    const mix = (a, b) => a.split("-")[1].slice(0, 3) + b.split("-")[1].slice(0, 3);

    // Mix user ids based on order
    const pp = mix(id1, id2);

    // Construct chat id
    const chatId = [p1, p2, pp].join("-");
    return chatId;
}

/**
 * Check if a chat exists.
 *
 * @param chatId - the ID of the chat to check
 * @return true if the chat exists, false otherwise
 */
export async function chatExists(chatId: Id){
    return await db.realmConf.issetCollection(chatId);
}

/**
 * Asynchronously creates a chat with the given name and ownerId.
 *
 * @param name - The name of the chat
 * @param ownerId - The ID of the chat owner
 * @return The ID of the newly created chat
 */
export async function createChat(name: string, ownerId: Id): Promise<Id>{
    const chatId = genId();
    
    await db.realmConf.add(chatId, {
        name,
        owner: ownerId,
        img: false,
        _id: "set"
    });
    
    const permSys = new PermissionSystem(chatId);
    const rootRole = await permSys.createRole("root", { p: getAllPermissions(Permissions) });

    const categoryId = genId();
    await db.realmConf.add(chatId, {
        cid: categoryId,
        name: "general",
        i: 0,
    }, false);

    await db.realmConf.add(chatId, {
        chid: genId(),
        name: "main",
        type: "text",
        category: categoryId,
        i: 0,
        rp: []
    }, false);

    await db.realmConf.add(chatId, {
        chid: genId(),
        name: "general",
        type: "voice",
        category: categoryId,
        i: 1,
        rp: []
    }, false);

    await db.mess.checkCollection(chatId);

    await addUserToChat(chatId, ownerId, [rootRole._id]);

    return chatId;
}

/**
 * Adds a user to a chat.
 *
 * @param chatId - The ID of the chat
 * @param userId - The ID of the user to add
 * @param roles - The roles to assign to the user
 * @return A Promise that resolves when the user is added to the chat
 */
export async function addUserToChat(chatId: Id, userId: Id, roles: Id[]=[]){
    await db.realmUser.add(chatId, {
        u: userId,
        r: roles
    }, false);

    await db.userData.add(userId, {
        realm: chatId,
    }, false);
}

/**
 * Removes/exits a user from the chat.
 *
 * @param chatId - The ID of the chat
 * @param userId - The ID of the user to be removed
 * @return A promise that resolves when the user is removed from the chat
 */
export async function exitChat(chatId: Id, userId: Id){
    await db.realmUser.removeOne(chatId, { u: userId });
    await db.userData.removeOne(userId, { realm: chatId });
}

/**
 * A function to create a privilege for two users.
 *
 * @param toId - the ID of the user receiving the privilege
 * @param fromId - the ID of the user granting the privilege
 */
export async function createPriv(toId: Id, fromId: Id){
    await db.userData.add(toId, {
        priv: fromId
    }, false);

    await db.userData.add(fromId, {
        priv: toId
    }, false);

    await db.mess.checkCollection(combineId(toId, fromId));
}