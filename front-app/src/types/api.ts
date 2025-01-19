export interface Api_fileFunc_read__options {
    file: File;
    callback: (xhr: XMLHttpRequest) => void;
    maxSize: number;
    maxName: number;
    endpoint: string;
    addionalFields?: (xhr: XMLHttpRequest, formData: FormData) => void;
}