import SocketEventEngine from "../chat/engine.js";
import { bot_edit, bot_generate_token, bot_get_realms, bot_profile_remove, bot_realm_exit } from "./logic/menageBot.js";
import { bots_create, bots_delete, bots_get } from "./logic/mainList.js";
const events = [
    ["bots.get", 1000, true, bots_get],
    ["bot.delete", 1000, true, bots_delete],
    ["bot.create", 1000, true, bots_create],
    ["bot.edit", 1000, true, bot_edit],
    ["bot.get.realms", 1000, true, bot_get_realms],
    ["bot.realm.exit", 1000, true, bot_realm_exit],
    ["bot.generate.token", 1000, true, bot_generate_token],
    ["bot.profile.remove", 1000, true, bot_profile_remove],
];
export default (socket) => {
    const engine = new SocketEventEngine(socket);
    for (const event of events) {
        engine.add(event[0], event[1], event[2], event[3]);
    }
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVnaXN0ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9iYWNrL3NvY2tldC9kZXYtcGFuZWwvcmVnaXN0ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0EsT0FBTyxpQkFBaUIsTUFBTSxnQkFBZ0IsQ0FBQztBQUUvQyxPQUFPLEVBQUUsUUFBUSxFQUFFLGtCQUFrQixFQUFFLGNBQWMsRUFBRSxrQkFBa0IsRUFBRSxjQUFjLEVBQUUsTUFBTSxtQkFBbUIsQ0FBQztBQUNySCxPQUFPLEVBQUUsV0FBVyxFQUFFLFdBQVcsRUFBRSxRQUFRLEVBQUUsTUFBTSxrQkFBa0IsQ0FBQztBQUV0RSxNQUFNLE1BQU0sR0FBYTtJQUNyQixDQUFDLFVBQVUsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLFFBQVEsQ0FBQztJQUNsQyxDQUFDLFlBQVksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLFdBQVcsQ0FBQztJQUN2QyxDQUFDLFlBQVksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLFdBQVcsQ0FBQztJQUV2QyxDQUFDLFVBQVUsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLFFBQVEsQ0FBQztJQUNsQyxDQUFDLGdCQUFnQixFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsY0FBYyxDQUFDO0lBQzlDLENBQUMsZ0JBQWdCLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxjQUFjLENBQUM7SUFDOUMsQ0FBQyxvQkFBb0IsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLGtCQUFrQixDQUFDO0lBQ3RELENBQUMsb0JBQW9CLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxrQkFBa0IsQ0FBQztDQUN6RCxDQUFBO0FBRUQsZUFBZSxDQUFDLE1BQWMsRUFBRSxFQUFFO0lBQzlCLE1BQU0sTUFBTSxHQUFHLElBQUksaUJBQWlCLENBQUMsTUFBTSxDQUFDLENBQUM7SUFFN0MsS0FBSyxNQUFNLEtBQUssSUFBSSxNQUFNLEVBQUUsQ0FBQztRQUN6QixNQUFNLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ3ZELENBQUM7QUFDTCxDQUFDLENBQUEifQ==