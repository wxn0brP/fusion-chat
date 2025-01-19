import Id from "../Id";

// message

export interface Core_mess__MessageBase {
    msg: string;
}

export interface Core_mess__dbMessage extends Core_mess__MessageBase {
    _id: Id;
    fr: Id;
    msg: string;
    
    lastEdit?: string; // edit time (36 system format)
    res?: Id; // reponse message id
    reacts?: {
        [react: string]: Id[]
    }
    embed?: Core_mess__embed
    silent?: boolean
}

export interface Core_mess__sendMessage extends Core_mess__MessageBase {
    to: Id;
    chnl: Id;

    res?: Id;
    silent?: boolean;
}

export interface Core_mess__receivedMessage extends Core_mess__MessageBase {
    _id: Id;
    fr: Id;
    chnl: Id;
    to: Id;

    embed?: Core_mess__embed;
    res?: Id;
}

export interface Core_mess__command_arg_base{
    name: string;
    type: "text" | "number" | "boolean" | "user" | "date" | "map" | "date-time" | "time" | "list";
    optional?: boolean;
}

export interface Core_mess__command_arg_list {
    name: string;
    type: "list";
    list: string[];
    optional?: boolean;
}

export type Core_mess__command_arg = Core_mess__command_arg_base | Core_mess__command_arg_list;

export interface Core_mess__command {
    args: Core_mess__command_arg[];
    exe(msg: Core_mess__dbMessage, args: any[]): number,
    name?: string;
}

export interface Core_mess__embed {
    title: string;

    url?: string;
    description?: string;
    image?: string;
    customFields?: Record<string, string>;
}