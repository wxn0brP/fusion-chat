import { Channel_Type } from "../channel";

export interface Ui_contextMenu__messageOptions {
    pin?: boolean,
    delete?: boolean;
    edit?: boolean;
}

export interface Ui_contextMenu__channelOptions{
    type?: Channel_Type;
}

export interface Ui_EmojiData_emoji {
    id: string;
    name: string;
    keywords: string[];
    skins: {
        unified?: string;
        native?: string;
    }[];
    emoticons?: string[];
    version?: number;
}

export interface Ui_EmojiData {
    categories: { id: string, emojis: string[] }[];
    emojis: {
        [key: string]: Ui_EmojiData_emoji;
    }
}