import { Socket } from "socket.io";
import SocketEventEngine from "../chat/engine";
import { Events } from "../chat/register";
import { bot_edit, bot_generate_token, bot_get_realms, bot_realm_exit } from "./logic/menageBot";
import { bots_create, bots_delete, bots_get } from "./logic/mainList";

const events: Events[] = [
    ["bots.get", 1000, true, bots_get],
    ["bot.delete", 1000, true, bots_delete],
    ["bot.create", 1000, true, bots_create],

    ["bot.edit", 1000, true, bot_edit],
    ["bot.get.realms", 1000, true, bot_get_realms],
    ["bot.realm.exit", 1000, true, bot_realm_exit],
    ["bot.generate.token", 1000, true, bot_generate_token],
]

export default (socket: Socket) => {
    const engine = new SocketEventEngine(socket);

    for (const event of events) {
        engine.add(event[0], event[1], event[2], event[3]);
    }
}