import { Channel_Type } from "../../../types/channel";
import Id from "../../../types/Id";

export interface Settings_rs__SubscribedChannel {
    sr: Id; // source realm ID
    sc: Id; // source channel ID
    tc: Id; // target channel ID
    // tr: the target realm ID can be inferred from the context in which the subscription is stored
    name: string;
}

export interface Settings_rs__Addons {
    subscribedChannels: Settings_rs__SubscribedChannel[];
}

export interface Settings_rs__Meta {
    name: string;
    owner: Id;
    img: boolean;
}

export interface Settings_rs__Category {
    cid: Id;
    name: string;
    i: number; // index
}

export interface Settings_rs__Channel {
    chid: Id;
    name: string;
    type: Channel_Type;
    category: Id;
    i: number; // index
    rp: Id[]; // role permissions
    desc?: string; // description
}

export interface Settings_rs__Emoji {
    unicode: number;
    name: string;
}

export interface Settings_rs__Webhook {
    whid: Id;
    name: string;
    template: string;
    chnl: Id;
    ajv: Record<string, any>; // additional JSON validation
    required: string[];
    embed?: {
        title: string;
        description: string;
        url: string;
        image: string;
        customFields: Record<string, any>;
    };
}

export interface Settings_rs__User {
    u: Id; // user ID
    r: Id[]; // roles
}

export interface Settings_rs__Role {
    _id: Id;
    lvl: number;
    name: string;
    p: number; // permissions
    c?: string; // color code
}

export interface Settings {
    addons: Settings_rs__Addons;
    meta: Settings_rs__Meta;
    categories: Settings_rs__Category[];
    channels: Settings_rs__Channel[];
    banUsers: Id[];
    emojis: Settings_rs__Emoji[];
    webhooks: Settings_rs__Webhook[];
    users: Settings_rs__User[];
    roles: Settings_rs__Role[];
}

export interface Settings_rs__Categories {
    meta: HTMLElement;
    category: HTMLElement;
    editChannel: HTMLElement;
    role: HTMLElement;
    editRole: HTMLElement;
    usersManager: HTMLElement;
    emoji: HTMLElement;
    webhook: HTMLElement;
    editWebhook: HTMLElement;
}

export const settingsKeys = [
    "meta",
    "category",
    "editChannel",
    "role",
    "editRole",
    "usersManager",
    "emoji",
    "webhook",
    "editWebhook",
] as const;

export type Settings_rs__SettingsNav = {
    [Key in typeof settingsKeys[number]]?: boolean;
};

export interface Settings_rs__CategorySwitcherButton {
    text: string;
    name: string;
    req: string[];
    p?: number;
    render?: () => void;
}