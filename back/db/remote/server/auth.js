const jwt = require("jwt-simple");
const secret = process.env.JWT || "secret";

async function authMiddleware(req, res, next){
    const token = req.headers["authorization"];
    if(!token){
        return res.status(401).json({ err: true, msg: "Access denied. No token provided." });
    }

    try{
        const user = jwt.decode(token, secret);
        if(!user || !user._id){
            return res.status(401).json({ err: true, msg: "Invalid token." });
        }

        const userD = await global.db.findOne("user", { _id: user._id });
        if(!userD){
            return res.status(401).json({ err: true, msg: "Invalid token." });
        }
        
        req.user = user;
        next();
    }catch(err){
        res.status(500).json({ err: true, msg: "An error occurred during authentication." });
        console.log(err);
    }
}

async function addAccess(){
    const user = await global.db.add("user", {});
    const token = jwt.encode(user, secret);

    return token;
}

async function removeAccess(id){
    await global.db.removeOne("user", { _id: id });
}

module.exports = {
    authMiddleware,
    addAccess,
    removeAccess
}