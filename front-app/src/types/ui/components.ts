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

export interface Ui_Media__Options {
    maxScale?: number;
    minScale?: number;
    scaleStep?: number;
    rotationStep?: number;
    doubleTapDelay?: number;
    isVideo?: boolean | "auto";
}

export interface Ui_Media__State {
    scale: number;
    rotation: number;
    position: { x: number, y: number };
    brightness: number;
    contrast: number;
    saturation: number;
    blur: number;
    isDragging: boolean;
    dragStart: { x: number, y: number };
    lastTap: number;
    lastTapPosition: { x: number, y: number };
    initialPinchDistance: number | null;
    initialRotation: number | null;
    previousTouches: {
        identifier: number,
        pageX: number,
        pageY: number
    }[] | null;
    isAnimating: boolean;
}