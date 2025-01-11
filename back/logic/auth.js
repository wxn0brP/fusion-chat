import db from "../dataBase.js";
import { create, decode, KeyIndex } from "./token/index.js";

/**
 * Asynchronously authenticates a token and returns the corresponding user.
 *
 * @param {string} token - The token to be authenticated
 * @return {Promise<object>} The authenticated user if successful, otherwise false
 */
export async function authUser(token, tokenDecoded={}){
    try{
        const data = await decode(token, KeyIndex.USER_TOKEN);
        if(!data) return false;
        tokenDecoded.data = data;
    
        const { id } = data;
        if(!id) return false;
        
        const tokenD = await db.data.findOne("token", { token });
        if(!tokenD) return false;
    
        const user = await db.data.findOne("user", { _id: id }, {}, { select: ["_id", "name", "email"] });
        if(!user) return false;
    
        return user;
    }catch{
        return false;
    }
}

/**
 * Creates a JWT token for the given user.
 *
 * @param {Object} user - the user object
 * @return {string} the JWT token
 */
export async function createUser(user){
    const pay = {
        id: user._id,
    }
    return await create(pay, "30d", KeyIndex.USER_TOKEN);
}