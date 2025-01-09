import hub from "../../hub";
hub("mess");

import messCmd from "./cmd";
import vars from "../../var/var";
import messStyle from "./style";
import apis from "../../api/apis";
import formatFunc from "./format";
import coreFunc from "../coreFunc";
import utils from "../../utils/utils";
import socket from "../socket/socket";
import fileFunc from "../../api/file";
import messInteract from "./interact";
import { messHTML, mglVar } from "../../var/html";
import contextMenu from "../../ui/components/contextMenu";
import { Api_fileFunc_read__options } from "../../types/api";
import permissionFunc, { PermissionFlags } from "../../utils/perm";
import { Core_mess__dbMessage, Core_mess__sendMessage } from "../../types/core/mess";
import staticData from "../../var/staticData";

export const maxMessLen = 2000; 
export const editMessText = `<span class="editMessText noneselect" title="edit $$">(edit)</span>`;

const messFunc = {
    sendMess(){
        if(!vars.chat.to || !vars.chat.chnl) return;
        if(vars.chat.to == "main") return;

        const mess = messHTML.input.value.trim();
        if(!mess) return;
        if(mess.length > maxMessLen) return;

        if(!vars.temp.editId){
            const data: Core_mess__sendMessage = {
                to: vars.chat.to,
                chnl: vars.chat.chnl,
                msg: mess,
                res: vars.temp.replyId,
            }
            const exitCode = messCmd.send(data);
            if(exitCode == 0) socket.emit("mess", data);
        }else{
            socket.emit("message.edit", vars.chat.to, vars.temp.editId, mess);
            messInteract.editMessClose();
        }
        messHTML.input.value = "";
        messInteract.replyClose();
        coreFunc.focusInp();
        messStyle.sendBtnStyle();
        messStyle.messageHeight();
    },

    addMess(data: Core_mess__dbMessage, socroll: boolean=true, up: boolean=false){
        if(!data) return;

        /*
            .mess_message #mess__$id
                .mess_meta attr: _author
                    img
                    .mess_meta_text
                        span.mess_author_name
                        span.mess_time
                .mess_content attr: _plain
        */

        const messDiv = document.createElement("div");
        messDiv.classList.add("mess_message");
        messDiv.id = "mess__"+data._id;
        if(data.res) messDiv.setAttribute("resMsgID", data.res);

        const fromDiv = document.createElement("div");
        fromDiv.classList.add("mess_meta");
        fromDiv.setAttribute("_author", data.fr);

        const fromDivImg = document.createElement("img");
        fromDivImg.src = "/api/profile/img?id=" + data.fr;
        fromDiv.appendChild(fromDivImg);

        const fromDivText = document.createElement("div");
        fromDivText.classList.add("mess_meta_text");

        const fromDivTextName = document.createElement("span");
        fromDivTextName.innerHTML = apis.www.changeUserID(data.fr);
        fromDivTextName.classList.add("mess_author_name");
        if(!["%","^","("].includes(data.fr[0])){ // if not system/api let show profile
            fromDivTextName.addEventListener("click", () => {
                socket.emit("user.profile", data.fr);
            });
        }
        fromDivText.appendChild(fromDivTextName);

        const timeDiv = document.createElement("span");
        timeDiv.classList.add("mess_time");
        timeDiv.innerHTML = utils.formatDateFormUnux(utils.extractTimeFromId(data._id));
        fromDivText.appendChild(timeDiv);

        fromDiv.appendChild(fromDivText);
        messDiv.appendChild(fromDiv);

        const messContentDiv = document.createElement("div");
        messContentDiv.classList.add("mess_content");
        formatFunc.formatMess(data.msg, messContentDiv);
        messContentDiv.setAttribute("_plain", data.msg);
        messDiv.appendChild(messContentDiv);
        if(data.lastEdit){
            messContentDiv.innerHTML += editMessText.replace("$$", utils.formatDateFormUnux(parseInt(data.lastEdit, 36)));
        }
        if(data.embed)
           formatFunc.embed(data.embed, messContentDiv);

        if(data.reacts){
            const reactsDiv = document.createElement("div");
            reactsDiv.classList.add("mess_reacts");

            const keys = Object.keys(data.reacts);
            for(let key of keys){
                const users = data.reacts[key];
                const span = document.createElement("span");
                span.setAttribute("_key", key);
                span.setAttribute("_users", users.join(","));
                span.addEventListener("click", () => {
                    socket.emit("message.react", vars.chat.to, data._id, key);
                });
                reactsDiv.appendChild(span);
            }

            messStyle.styleMessReacts(reactsDiv);
            messDiv.appendChild(reactsDiv);
        }

        up ? messHTML.div.addUp(messDiv) : messHTML.div.add(messDiv);

        setTimeout(() => {
            const errMargin = 70; // (px)
            const isScrollAtBottom = messHTML.div.scrollTop + messHTML.div.clientHeight + messDiv.clientHeight + errMargin >= messHTML.div.scrollHeight;
            if(data.res)formatFunc.responeMess(data.res, messDiv);
            if(socroll && isScrollAtBottom){
                messDiv.scrollIntoView({behavior: "smooth"});
            }
        }, 100);

        contextMenu.menuClickEvent(messDiv, (e) => {
            const isMessPinned = vars.chat.pinned.findIndex((m) => m._id == data._id) != -1;
            const canDelete = data.fr == vars.user._id || permissionFunc.canAction(PermissionFlags.ManageMessages);
            contextMenu.message(e, data._id, {
                pin: !isMessPinned,
                edit: data.fr == vars.user._id,
                delete: canDelete
            });
        }, (target) => {
            return !staticData.contextmenuTags.includes(target.tagName.toLowerCase());
        });

        messDiv.addEventListener("click", () => {
            vars.chat.selectedMess = data._id;
        })
    },

    sendFile(f: File | undefined){
        // TODO add check permissions about sending files
        if(f){
            read(f);
        }else{
            const input = document.createElement("input");
            input.type = "file";
            input.click();
            input.addEventListener("change", (e: Event) => {
                const target = e.target as HTMLInputElement;
                const file = target.files?.[0];
                if (file) {
                    read(file);
                } else {
                    console.error("No file selected.");
                }
            });
        }

        function read(f: File){
            const opt: Api_fileFunc_read__options = {
                file: f,
                callback: (xhr: XMLHttpRequest) => {
                    const path = JSON.parse(xhr.responseText).path;
                    const mess = location.origin + path;
                    
                    const data = {
                        to: vars.chat.to,
                        chnl: vars.chat.chnl,
                        msg: mess,
                    }
                    socket.emit("mess", data);
                },
                maxSize: 8*1024*1024,
                maxName: 60,
                endpoint: "/api/file/upload"
            }

            fileFunc.read(opt);
        }
    },
}

export default messFunc;
mglVar.messFunc = messFunc;