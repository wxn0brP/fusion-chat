import Id from "#id";

export interface FireBaseSend_Data {
    to: Id,
    title: string,
    body: string,
    checkSocket?: boolean,
    action?: {
        type: string,
        data: any[]
    }
}