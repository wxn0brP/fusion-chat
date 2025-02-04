import { readFileSync, watchFile } from "fs";
import InternalCode from "./codes";

let config = [];

export function expressMiddleware(req, res, next) {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    if (ip == "::1") return next();

    if (config.includes(ip)) {
        return res.status(403).json({ err: true, c: InternalCode.UserError.Express.IpBanned, msg: "Access denied. IP address is banned." });
    }
    next();
}

export function socketIoMiddleware(socket, next) {
    const ip = socket.request.headers['x-forwarded-for'] || socket.request.socket.remoteAddress;
    if (ip == "::1") return next();

    if (config.includes(ip)) {
        return next(new Error("Access denied. IP address is banned."));
    }
    next();
}

function loadConfig() {
    config = JSON.parse(readFileSync("config/bannedIP.json", "utf8"));
    if (!Array.isArray(config)) {
        config = [];
        console.error("config/bannedIP.json must be an string array.");
    }
}

loadConfig();
watchFile("config/bannedIP.json", () => {
    loadConfig();
});