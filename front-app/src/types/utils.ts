import { InternalCodeType } from "./code";
import { Lang_Api } from "./lang/api";
import { Lang_common } from "./lang/common";
import { Lang_Media } from "./lang/media";
import { Lang_settings } from "./lang/settings";
import { Lang_Settings__Realm } from "./lang/settings.realm";
import { Lang_Settings__User } from "./lang/settings.user";
import { Lang_Socket } from "./lang/socket";
import { Lang_UI } from "./lang/ui";
import { Lang_uni } from "./lang/uni";

export interface Utils_updater<T> {
    _value: T;
    get(): T;
    set(newValue: T): void;
}

export interface Lang_Pkg {
    api?: Lang_Api
    media?: Lang_Media
    settings?: Lang_settings
    settings_realm?: Lang_Settings__Realm
    settings_user?: Lang_Settings__User
    socket?: Lang_Socket
    ui?: Lang_UI
    uni?: Lang_uni
    common?: Lang_common,
    InternalCode?: InternalCodeType,
}