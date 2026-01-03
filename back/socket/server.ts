import { GlovesLinkServer } from "@wxn0brp/gloves-link-server";

export const io = new GlovesLinkServer({
    logs: process.env.NODE_ENV === "development"
});