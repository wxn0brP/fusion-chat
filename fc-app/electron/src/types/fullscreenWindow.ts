export interface DataNext {
    windowTitle?: string;
    windowWidth?: number;
    windowHeight?: number;
    windowX?: number;
    windowY?: number;
    monitor?: any;
    monitors?: Array<any>;
    resolve: (value?: any) => void;
    reject: (value?: any) => void;
}