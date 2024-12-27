import hub from "../../hub.js";
hub("mess");

import { messHTML, mglVar } from "../../var/html.js";
import vars from "../../var/var.js";
import messCmd from "./cmd.js";
import coreFunc from "../../core/coreFunc.js";
import apis from "../../api/apis.js";
import utils from "../../utils/utils.js";
import formatFunc from "./format.js";
import socket from "../socket/socket.js";
import messStyle from "./style.js";
import contextMenu from "../../ui/components/contextMenu.js";
import permissionFunc, { permissionFlags } from "../../utils/perm.js";
import fileFunc from "../../api/file.js";
import messInteract from "./interact.js";

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
            const data = {
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

    addMess(data, socroll=true, up=false){
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
        if(data.e){
            messContentDiv.innerHTML += editMessText.replace("$$", utils.formatDateFormUnux(parseInt(data.e, 36)));
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
            const canDelete = data.fr == vars.user._id || permissionFunc.canAction(permissionFlags.manageMessages);
            contextMenu.message(e, data._id, {
                pin: !isMessPinned,
                edit: data.fr == vars.user._id,
                delete: canDelete
            });
        });
    },

    sendFile(f){
        // TODO add check permissions about sending files
        if(f){
            read(f);
        }else{
            const input = document.createElement("input");
            input.type = "file";
            input.click();
            input.addEventListener("change", e => read(e.target.files[0]));
        }

        function read(f){
            const opt = {
                file: f,
                callback: (xhr) => {
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