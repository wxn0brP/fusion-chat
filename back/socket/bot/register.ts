import { Socket } from "socket.io";
import SocketEventEngine from "../chat/engine";
import { Events, generalEvents } from "../chat/register";

import { get_bot_info } from "./logic/bot";
import sendMessage from "#logic/sendMessage";
import { Socket_User } from "#types/socket/user";
import { Request } from "#types/sendMessage";

const botEvents: Events[] = [
    ["get.bot.info", 1_000, true, get_bot_info],
    ["mess", 200, false,
        async (suser: Socket_User, req: Request) => {
            return await sendMessage(req, suser, {
                frPrefix: "^"
            });
        }
    ],
];

export default (socket: Socket) => {
    const engine = new SocketEventEngine(socket);

    for (const event of generalEvents) {
        engine.add(event[0], event[1], event[2], event[3]);
    }

    for (const event of botEvents) {
        engine.add(event[0], event[1], event[2], event[3]);
    }
}