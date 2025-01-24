import hub from "../hub";
import Id from "../types/Id";
import uiFunc from "../ui/helpers/uiFunc";
import { Api_fileFunc_read__options } from "../types/api";
import debugFunc, { LogLevel } from "../core/debug";
import LangPkg from "../utils/translate";
hub("file");

const fileFunc = {
    read(options: Api_fileFunc_read__options) {
        const { file, callback, maxSize, maxName, endpoint } = options;
        if (!file || !callback || !maxSize || !maxName || !endpoint) {
            return;
        }

        if (file.size > maxSize) {
            uiFunc.uiMsgT(LangPkg.ui.file.size_limit, (maxSize / 1024 / 1024) + "MB");
            return;
        }
        if (file.name.length > maxName) {
            uiFunc.uiMsgT(LangPkg.ui.file.name_limit, maxName);
            return;
        }

        const reader = new FileReader();
        reader.onload = () => {
            const xhr = new XMLHttpRequest();
            xhr.open("POST", endpoint);

            xhr.onload = () => {
                if (xhr.status === 200) {
                    uiFunc.uiMsgT(LangPkg.ui.file.uploaded);
                    callback(xhr);
                } else {
                    uiFunc.uiMsgT(LangPkg.ui.file.upload_error, [": " + xhr.statusText]);
                }
            };

            xhr.onerror = () => {
                uiFunc.uiMsgT(LangPkg.ui.file.upload_error);
            }

            const token = localStorage.getItem("token");
            if (!token) {
                uiFunc.uiMsgT(LangPkg.api.auth_error);
                return;
            }

            xhr.setRequestHeader("Authorization", token);
            const formData = new FormData();
            formData.append("file", file);
            if (options.additionalFields) options.additionalFields(xhr, formData);
            xhr.send(formData);
        };

        reader.readAsArrayBuffer(file);
    },

    profile(file: File) {
        const opt: Api_fileFunc_read__options = {
            file,
            callback: () => {
                debugFunc.msg(LogLevel.INFO, LangPkg.ui.file.uploaded);
            },
            maxSize: 4 * 1024 * 1024,
            maxName: 60,
            endpoint: "/api/profile/upload"
        }

        fileFunc.read(opt);
    },

    realm(file: File, id: Id) {
        const opt: Api_fileFunc_read__options = {
            file,
            callback: () => {
                debugFunc.msg(LogLevel.INFO, LangPkg.ui.file.uploaded);
            },
            maxSize: 4 * 1024 * 1024,
            maxName: 60,
            endpoint: "/api/realm/profile/upload",
            additionalFields: (xhr: XMLHttpRequest) => {
                xhr.setRequestHeader("realm", id);
            }
        }

        fileFunc.read(opt);
    },

    emocji(file: File, realmId: Id) {
        const opts: Api_fileFunc_read__options = {
            file: file,
            callback: () => {
                debugFunc.msg(LogLevel.INFO, LangPkg.ui.file.uploaded);
            },
            maxSize: 4 * 1024 * 1024,
            maxName: 100,
            endpoint: "/api/emoji/upload",
            additionalFields: (xhr: XMLHttpRequest) => {
                xhr.setRequestHeader("realm", realmId);
            }
        };

        fileFunc.read(opts);
    },
};

export default fileFunc;