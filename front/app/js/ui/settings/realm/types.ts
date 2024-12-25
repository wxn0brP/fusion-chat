import Id from "../../../utils/Id";

export interface SubscribedChannel {
    sr: Id; // source realm ID
    sc: Id; // source channel ID
    tc: Id; // target channel ID
    // tr: the target realm ID can be inferred from the context in which the subscription is stored
    name: string;
}

export interface Addons {
    subscribedChannels: SubscribedChannel[];
}

export interface Meta {
    name: string;
    owner: Id;
    img: boolean;
}

export interface Category {
    cid: Id; // category ID
    name: string;
    i: number; // index
}

export interface Channel {
    chid: Id; // channel ID
    name: string;
    type: 'text' | 'voice' | 'realm_event' | 'open_event';
    category: Id; // category ID
    i: number; // index
    rp: Id[]; // role permissions
    desc?: string; // description
    threads?: Id[]; // threads IDs
}

export interface Emoji {
    unicode: number;
    name: string;
}

export interface Webhook {
    whid: Id; // webhook ID
    name: string;
    template: string;
    chnl: Id; // channel ID
    ajv: Record<string, any>; // additional JSON validation
    required: string[];
    token?: string;
    embed?: {
        title: string;
        description: string;
        url: string;
        image: string;
        customFields: Record<string, any>;
    };
}

export interface User {
    u: Id; // user ID
    r: Id[]; // roles
}

export interface Role {
    _id: Id; // role ID
    lvl: number; // level
    name: string; // role name
    p: number; // permissions
    c?: string; // color code
}

export interface Settings {
    addons: Addons;
    meta: Meta;
    categories: Category[];
    channels: Channel[];
    banUsers: Id[]; // placeholder for banned users
    emojis: Emoji[]; // placeholder for emojis
    webhooks: Webhook[];
    users: User[];
    roles: Role[];
}

export interface Categories {
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

declare global {
    interface HTMLElement {
        fadeOut: Function;
        fadeIn: Function;
    }
}

export {};