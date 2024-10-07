import valid from "../../../logic/validData.js";
import ValidError from "../../../logic/validError.js";

const roomPrefix = "voice-";

export async function voice_join(socket, to){
    const validE = new ValidError("voice.join");
    if(!valid.str(to, 0, 30)) return validE.valid("to");

    emitToRoom(to, "voice.join", socket.user._id);
    emitToRoom(to, "refreshData", "voice.getUsers", to);
    socket.join(roomPrefix + to);
    socket.voiceRoom = to;
    return { err: false };
}

export async function voice_sendData(suser, voiceRoom, data){
    if(!voiceRoom) return;
    emitToRoom(voiceRoom, "voice.sendData", suser._id, data);
}

export function leaveVoiceChannel(socket){
    if(!socket.voiceRoom) return;
    const room = socket.voiceRoom;

    socket.leave(roomPrefix + room);
    socket.voiceRoom = null;
    emitToRoom(room, "refreshData", "voice.getUsers");
    emitToRoom(room, "voice.leave", socket.user._id);
}

export function voice_getUsers(socket){
    if(!socket.voiceRoom) return;
    const to = socket.voiceRoom;

    const sockets = io.of("/").adapter.rooms.get(roomPrefix + to);
    const users = [];

    for(const socketId of sockets){
        const socket = io.sockets.sockets.get(socketId);
        if(socket && socket.user) users.push(socket.user._id);
    }

    return { err: false, res: [...new Set(users)] };
}

export async function call_private_init(suser, id){
    const validE = new ValidError("call.private.init");
    if(!valid.id(id)) return validE.valid("id");

    const sockets = global.getSocket(id);
    if(sockets.length == 0) return { err: false, res: true }

    global.sendToSocket(id, "call.private.init", suser._id);
    return { err: false };
}

export async function call_private_answer(suser, id, answer){
    const validE = new ValidError("call.private.answer");
    if(!valid.id(id)) return validE.valid("id");
    if(!valid.bool(answer)) return validE.valid("answer");

    global.sendToSocket(id, "call.private.answer", suser._id, answer);
    return { err: false };
}

function emitToRoom(room, ...args){
    io.of("/").to(roomPrefix + room).emit(...args);
}