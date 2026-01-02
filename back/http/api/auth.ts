import InternalCode from "#codes";
import { authUser } from "#logic/auth";
import { Socket_User } from "#types/socket/user";
import { RouteHandler } from "@wxn0brp/falcon-frame/types";

export const authenticateMiddleware: RouteHandler = async (req, res, next) => {
    const token = req.headers["authorization"];
    if (!token) {
        return res.status(401).json({
            err: true,
            c: InternalCode.UserError.Express.AuthError_TokenRequired,
            msg: "Access denied. No token provided.",
        });
    }

    try {
        const user = (await authUser(token)) as Socket_User;
        if (!user) {
            return res.status(401).json({
                err: true,
                c: InternalCode.UserError.Express.AuthError_InvalidToken,
                msg: "Invalid token.",
            });
        }
        req.user = user._id;
        next();
    } catch (err) {
        res.status(500).json({
            err: true,
            c: InternalCode.ServerError.Express.AuthError,
            msg: "An error occurred during authentication.",
        });
    }
};