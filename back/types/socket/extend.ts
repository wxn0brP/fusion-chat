import { GlovesLinkServer, GLSocket } from "@wxn0brp/gloves-link-server";

declare global {
	var getSocket: (to: string, room?: string) => GLSocket[];
	var sendToSocket: (id: string, channel: string, ...args: any) => void;
	var sendToChatUsers: (to: string, channel: string, ...args: any) => void;
	var io: GlovesLinkServer;
}
