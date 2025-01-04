import { mglHTML } from "../var/html";

declare global {
    interface Window {
        mglHTML: typeof mglHTML
        mglInt: {
            [key: string]: any
        };
        mglVar: {
            [key: string]: any
        };
    }
}

export {}