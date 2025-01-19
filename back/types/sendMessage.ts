import { Id } from "./base";

export interface Request {
    to: Id; // The identifier of the recipient or chat.
    msg: string; // The message content.
    chnl: Id; // The channel identifier.
    enc?: string; // Optional flag to indicate if the message is encrypted.
    res?: Id; // Optional identifier for the message being replied to.
    silent?: boolean; // Optional flag to send the message silently without notification.
}

export interface User {
    _id: Id; // The identifier of the sender.
    name: string; // The name of the sender.
}

export interface Options {
    system?: boolean; // Optional flag to send the message as a system message. Default is false.
    customFields?: Object; // Optional custom fields for the message.
    minMsg?: number; // Optional minimum number of messages to send. Default is 0.
    maxMsg?: number; // Optional maximum number of messages to send. Default is 2000.
    frPrefix?: string; // Optional prefix for the message author.
}

export interface Message {
    _id?: Id;
    fr?: Id;
    to?: Id;
    msg?: string;
    chnl?: Id;
    res?: Id;
    silent?: boolean;
    enc?: string;
};