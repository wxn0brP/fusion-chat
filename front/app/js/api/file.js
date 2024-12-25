import hub from "../hub.js";
hub("file");

import uiFunc from "../ui/helpers/uiFunc.js";
import debugFunc from "../core/debug.js";
import translateFunc from "../utils/translate.js";

const fileFunc = {
    read(options){
        const { file, callback, maxSize, maxName, endpoint } = options;
        if(!file || !callback || !maxSize || !maxName || !endpoint){
            return;
        }

        if(file.size > maxSize){
            uiFunc.uiMsg(translateFunc.get("File size exceeds $ limit", (maxSize / 1024 / 1024) + "MB") + ".");
            return;
        }
        if(file.name.length > maxName){
            uiFunc.uiMsg(translateFunc.get("File name exceeds $ char limit", maxName) + ".");
            return;
        }

        const reader = new FileReader();
        reader.onload = () => {
            const xhr = new XMLHttpRequest();
            xhr.open("POST", endpoint);

            xhr.onload = () => {
                if(xhr.status === 200){
                    uiFunc.uiMsg(translateFunc.get("File uploaded successfully") + ".");
                    callback(xhr);
                }else{
                    uiFunc.uiMsg(translateFunc.get("Failed to upload file") + ": " + xhr.statusText);
                }
            };

            xhr.onerror = () => {
                uiFunc.uiMsg(translateFunc.get("An error occurred during the file upload") + ".");
            }

            const token = localStorage.getItem("token");
            if(!token){
                uiFunc.uiMsg(translateFunc.get("No authentication data found") + ".");
                return;
            }

            xhr.setRequestHeader("Authorization", token);
            const formData = new FormData();
            formData.append("file", file);
            if(options.addionalFields) options.addionalFields(xhr, formData);
            xhr.send(formData);
        };

        reader.readAsArrayBuffer(file);
    },

    profile(file){
        const opt = {
            file,
            callback: () => {
                lo("File uploaded successfully");
            },
            maxSize: 4*1024*1024,
            maxName: 60,
            endpoint: "/api/profile/upload"
        }

        fileFunc.read(opt);
    },

    server(file, id){
        const opt = {
            file,
            callback: () => {
                lo("File uploaded successfully");
            },
            maxSize: 4*1024*1024,
            maxName: 60,
            endpoint: "/api/realm/profile/upload",
            addionalFields: (xhr, formData) => {
                xhr.setRequestHeader("serverid", id);
            }
        }

        fileFunc.read(opt);
    },

    emocji(file, realmId){
        const opts = {
            file: file,
            callback: (xhr) => {
                lo("File uploaded successfully");
            },
            maxSize: 4*1024*1024,
            maxName: 100,
            endpoint: "/api/emoji/upload",
            addionalFields: (xhr, formData) => {
                xhr.setRequestHeader("server", realmId);
            }
        };

        fileFunc.read(opts);
    },
};

export default fileFunc;