import Id from "../types/Id";
import { Api_fileFunc_read__options } from "../types/api";
import uiFunc from "../utils/uiFunc";

const fileFunc = {
    read(options: Api_fileFunc_read__options) {
        const { file, callback, maxSize, maxName, endpoint } = options;
        if (!file || !callback || !maxSize || !maxName || !endpoint) {
            return;
        }

        if (file.size > maxSize) {
            uiFunc.uiMsg("File size limit: " + (maxSize / 1024 / 1024) + "MB");
            return;
        }
        if (file.name.length > maxName) {
            uiFunc.uiMsg("File name limit: " + maxName);
            return;
        }

        const reader = new FileReader();
        reader.onload = () => {
            const xhr = new XMLHttpRequest();
            xhr.open("POST", endpoint);

            xhr.onload = () => {
                if (xhr.status === 200) {
                    uiFunc.uiMsg("File uploaded");
                    callback(xhr);
                } else {
                    uiFunc.uiMsg("File upload error: " + xhr.statusText);
                }
            };

            xhr.onerror = () => {
                uiFunc.uiMsg("File upload error");
            }

            const token = localStorage.getItem("token");
            if (!token) {
                uiFunc.uiMsg("Auth error");
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

    profile(file: File, id: Id) {
        const opt: Api_fileFunc_read__options = {
            file,
            callback: () => {
                console.log("File uploaded");
            },
            maxSize: 4 * 1024 * 1024,
            maxName: 60,
            endpoint: "/api/bot/profile/upload",
            additionalFields: (xhr: XMLHttpRequest) => {
                xhr.setRequestHeader("id", id);
            }
        }

        fileFunc.read(opt);
    },
}

export default fileFunc;