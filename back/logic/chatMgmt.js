import fs from "fs";
import genId from "@wxn0brp/db/gen.js";

/**
 * A function to combine two user ids into a new chat id.
 *
 * @param {string} id_1 - The first user id
 * @param {string} id_2 - The second user id
 * @return {string} The combined chat id
 */
export function combinateId(id_1, id_2) {
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
 * @param {string} chatId - the ID of the chat to check
 * @return {boolean} true if the chat exists, false otherwise
 */
export async function chatExsists(chatId){
    return await global.db.groupSettings.issetCollection(chatId);
}

/**
 * Asynchronously creates a chat with the given name and ownerId.
 *
 * @param {string} name - The name of the chat
 * @param {string} ownerId - The ID of the chat owner
 * @return {string} The ID of the newly created chat
 */
export async function createChat(name, ownerId){
    const chatId = genId();
    const adminId = genId();
    
    await global.db.groupSettings.add(chatId, {
        name,
        owner: ownerId,
        img: false,
        _id: "set"
    });
    
    await global.db.groupSettings.add(chatId, {
        rid: adminId,
        name: "admin",
        p: "all",
        parent: "all",
    }, false);

    const categoryId = genId();
    await global.db.groupSettings.add(chatId, {
        cid: categoryId,
        name: "general",
        i: 0,
    }, false);

    await global.db.groupSettings.add(chatId, {
        chid: genId(),
        name: "main",
        type: "text",
        category: categoryId,
        i: 0,
        rp: []
    }, false);

    await global.db.groupSettings.add(chatId, {
        chid: genId(),
        name: "general",
        type: "voice",
        category: categoryId,
        i: 1,
        rp: []
    }, false);

    await global.db.mess.checkCollection(chatId);

    await addUserToChat(chatId, ownerId, [adminId]);

    return chatId;
}

/**
 * Adds a user to a chat.
 *
 * @param {string} chatId - The ID of the chat
 * @param {string} userId - The ID of the user to add
 * @param {string[]} roles - The roles to assign to the user
 * @return {Promise<void>} A Promise that resolves when the user is added to the chat
 */
export async function addUserToChat(chatId, userId, roles=[]){
    await global.db.usersPerms.add(chatId, {
        uid: userId,
        roles,
    }, false);

    await global.db.userDatas.add(userId, {
        group: chatId,
    }, false);
}

/**
 * Removes/exits a user from the chat.
 *
 * @param {string} chatId - The ID of the chat
 * @param {string} userId - The ID of the user to be removed
 * @return {Promise<void>} A promise that resolves when the user is removed from the chat
 */
export async function exitChat(chatId, userId){
    await global.db.usersPerms.removeOne(chatId, { uid: userId });
    await global.db.userDatas.removeOne(userId, { group: chatId });
}


/**
 * A function to create a privilege for two users.
 *
 * @param {type} toId - the ID of the user receiving the privilege
 * @param {type} fromId - the ID of the user granting the privilege
 * @return {type} 
 */
export async function createPriv(toId, fromId){
    await global.db.userDatas.add(toId, {
        priv: fromId//, block: true
    }, false);

    await global.db.userDatas.add(fromId, {
        priv: toId
    }, false);

    await global.db.mess.checkCollection(combinateId(toId, fromId));
}