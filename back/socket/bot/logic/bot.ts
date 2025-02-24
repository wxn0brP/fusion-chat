import { Socket_StandardRes } from "#types/socket/res";
import { Socket_User } from "#types/socket/user";

export async function get_bot_info(suser: Socket_User): Promise<Socket_StandardRes> {
    const data = {
        _id: suser._id,
        name: suser.name,
    }
    return { err: false, res: [data] };
}