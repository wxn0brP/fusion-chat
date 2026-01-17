import { Id } from "./id";

export interface WebPush_Opts {
    to: Id;
    title: string;
    body: string;
    checkSocket?: boolean;
    icon?: string;
    params?: Record<string, string>;
}