import db from "#db";
import firebaseSend from "#firebase";
import valid from "#logic/validData";
import ValidError from "#logic/validError";
import Id from "#id";
import Db_Data from "#types/db/data";
import { Socket_StandardRes } from "#types/socket/res";
import { Socket_User } from "#types/socket/user";
import { Socket } from "socket.io";

const roomPrefix = "voice-";

export async function voice_join(socket: Socket, to: Id): Promise<Socket_StandardRes> {
    const validE = new ValidError("voice.join");
    if (!valid.str(to, 16, 100)) return validE.valid("to");

    emitToRoom(to, "voice.join", socket.user._id);
    emitToRoom(to, "refreshData", "voice.get.users");
    socket.join(roomPrefix + to);
    socket.voiceRoom = to;
    return { err: false };
}

export function voice_sendData(suser: Socket_User, voiceRoom: Id, data: any) {
    if (!voiceRoom) return;
    emitToRoom(voiceRoom, "voice.sendData", suser._id, data);
}

export function leaveVoiceChannel(socket: Socket) {
    if (!socket.voiceRoom) return;
    const room = socket.voiceRoom;

    socket.leave(roomPrefix + room);
    socket.voiceRoom = null;
    emitToRoom(room, "refreshData", "voice.get.users");
    emitToRoom(room, "voice.leave", socket.user._id);
}

export function voice_getUsers(socket: Socket): Socket_StandardRes<Id[]> {
    if (!socket.voiceRoom) return;
    const to = socket.voiceRoom;

    const sockets = global.io.of("/").adapter.rooms.get(roomPrefix + to);
    const users: Id[] = [];

    for (const socketId of sockets) {
        const socket = global.io.sockets.sockets.get(socketId);
        if (socket && socket.user) users.push(socket.user._id);
    }

    return { err: false, res: [...new Set(users)] };
}

export async function call_dm_init(suser: Socket_User, id: Id): Promise<Socket_StandardRes> {
    const validE = new ValidError("call.dm.init");
    if (!valid.id(id)) return validE.valid("id");

    const sockets = global.getSocket(id);
    if (sockets.length == 0) {
        const targetName = await db.data.findOne<Db_Data.user>("user", { _id: id }).then(u => u.name);

        firebaseSend({
            to: id,
            title: targetName + " is calling you",
            body: "Join to the call",
            checkSocket: false,
            action: {
                type: "ctrl",
                data: [["call", suser._id]]
            }
        });
        return { err: false, res: [true] };
    }

    global.sendToSocket(id, "call.dm.init", suser._id);
    return { err: false };
}

export async function call_dm_answer(suser: Socket_User, id: string, answer: boolean): Promise<Socket_StandardRes> {
    const validE = new ValidError("call.dm.answer");
    if (!valid.id(id)) return validE.valid("id");
    if (!valid.bool(answer)) return validE.valid("answer");

    global.sendToSocket(id, "call.dm.answer", suser._id, answer);
    return { err: false };
}

function emitToRoom(room: string, ...args: any[]) {
    global.io.of("/").to(roomPrefix + room).emit(...args);
}