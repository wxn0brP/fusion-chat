const jwt = require("jwt-simple");

/**
 * Asynchronously authenticates a token and returns the corresponding user.
 *
 * @param {string} token - The token to be authenticated
 * @return {Promise<object>} The authenticated user if successful, otherwise false
 */
async function auth(token){
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
 * Decode a JWT token using the specified secret.
 *
 * @param {string} token - The JWT token to decode
 * @return {object|boolean} The decoded payload or false if decoding fails
 */
function decode(token){
    try{
        return jwt.decode(token, process.env.JWT || "secret");
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
function create(user){
    const pay = {
        id: user._id,
        exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 30), // (60s * 60m * 24h * 30d)
    }

    return jwt.encode(pay, process.env.JWT || "secret");
}

module.exports.auth = auth;
module.exports.create = create;
module.exports.decode = decode;