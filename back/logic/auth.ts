import db from "../dataBase.js";
import { Id } from "../types/base.js";
import { Socket_User } from "../types/socket/user.js";
import { create, decode, KeyIndex } from "./token/index.js";

/**
 * Asynchronously authenticates a token and returns the corresponding user.
 *
 * @param {string} token - The token to be authenticated
 * @return The authenticated user if successful, otherwise false
 */
export async function authUser(token: string, tokenDecoded={ data: null }): Promise<boolean|Socket_User>{
    try{
        const data = await decode(token, KeyIndex.USER_TOKEN) as { id: Id };
        if(!data) return false;
        tokenDecoded.data = data;
    
        const { id } = data;
        if(!id) return false;
        
        const tokenD = await db.data.findOne("token", { token });
        if(!tokenD) return false;
    
        const user = await db.data.findOne("user", { _id: id }, {}, { select: ["_id", "name", "email"] });
        if(!user) return false;
    
        return user as Socket_User;
    }catch{
        return false;
    }
}

/**
 * Creates a JWT token for the given user.
 *
 * @param user - the user object
 * @return the JWT token
 */
export async function createUser(user: { _id: Id }) {
    const pay = {
        id: user._id,
    }
    return await create(pay, "30d", KeyIndex.USER_TOKEN);
}