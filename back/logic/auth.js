import jwt from "jwt-simple";

/**
 * Asynchronously authenticates a token and returns the corresponding user.
 *
 * @param {string} token - The token to be authenticated
 * @return {Promise<object>} The authenticated user if successful, otherwise false
 */
export async function auth(token){
    const data = decode(token);
    if(!data) return false;

    const {
        id, exp
    } = data;

    if(!id || !exp) return false;

    if(new Date(exp * 1000) < new Date()) return false;
    
    const tokenD = await global.db.data.findOne("token", { token });
    if(!tokenD) return false;

    const user = await global.db.data.findOne("user", { _id: id });
    if(!user) return false;

    return user;
}

/**
 * Creates a JWT token for the given user.
 *
 * @param {Object} user - the user object
 * @return {string} the JWT token
 */
export function createUser(user){
    const pay = {
        id: user._id,
    }
    return create(pay, true);
}

/**
 * Decode a JWT token using the specified secret.
 *
 * @param {string} token - The JWT token to decode
 * @return {object|boolean} The decoded payload or false if decoding fails
 */
export function decode(token){
    try{
        return jwt.decode(token, process.env.JWT || "secret");
    }catch{
        return false;
    }
}

/**
 * Creates a JWT token from the given data.
 *
 * @param {Object} data - The payload for the JWT token
 * @param {boolean|number} exp - The expiration time of the token.
 *                              If true, the token will expire in 30 days.
 *                              If false, the token will never expire.
 *                              If a number, the token will expire in that many seconds.
 * @return {string} The JWT token
 */
export function create(data, exp=true){
    if(exp == true){
        exp = 60 * 60 * 24 * 30;
    }else if(typeof exp == "number"){
        exp = exp;
    }else{
        exp = 0;
    }
    if(exp > 0) data.exp = Math.floor(Date.now() / 1000) + exp;

    return jwt.encode(data, process.env.JWT || "secret");
}