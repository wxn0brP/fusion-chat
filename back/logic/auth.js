import { create, decode, KeyIndex } from "./token/index.js";

/**
 * Asynchronously authenticates a token and returns the corresponding user.
 *
 * @param {string} token - The token to be authenticated
 * @return {Promise<object>} The authenticated user if successful, otherwise false
 */
export async function authUser(token){
    try{
        const data = await decode(token, KeyIndex.USER_TOKEN);
        if(!data) return false;
    
        const { id } = data;
        if(!id) return false;
        
        const tokenD = await global.db.data.findOne("token", { token });
        if(!tokenD) return false;
    
        const user = await global.db.data.findOne("user", { _id: id });
        if(!user) return false;
        delete user.password;
    
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