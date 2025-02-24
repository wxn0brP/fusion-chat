import Id from "./Id";

export interface GetInServer__Response {
    err: boolean;
    name: string;
}

export interface API_botMeta {
    id: Id;
    name: string;
}

export interface Api_fileFunc_read__options {
    file: File;
    callback: (xhr: XMLHttpRequest) => void;
    maxSize: number;
    maxName: number;
    endpoint: string;
    additionalFields?: (xhr: XMLHttpRequest, formData: FormData) => void;
}