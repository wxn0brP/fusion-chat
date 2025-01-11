import hub from "../../hub";
hub("render/user");

import vars from "../../var/var";
import apis from "../../api/apis";
import renderUtils from "./utils";
import render_realm from "./realm";
import coreFunc from "../../core/coreFunc";
import socket from "../../core/socket/socket";
import mainView from "../components/mainView";
import mainViewInteract from "../interact/mainView";
import { navHTML, renderHTML } from "../../var/html";
import { Core_socket__friendStatus, Core_socket__user_profile } from "../../types/core/socket";
import utils from "../../utils/utils";
import LangPkg from "../../utils/translate";

const render_user = {
    localUserProfile(){
        navHTML.user__name.innerHTML = apis.www.changeUserID(vars.user._id);
        navHTML.user__status.innerHTML = vars.user.statusText || vars.user.status || "Online";
    },

    userProfile(data: Core_socket__user_profile){
        if(!data) return;
        const targetIsMe = data._id == vars.user._id;
        const imgLink = "/api/profile/img?id=" + data._id;

        renderHTML.userProfile.innerHTML = `
            <div id="userProfileInfo">
                <img src="${imgLink}" onclick="createMediaPopup('${imgLink}')" alt="User logo">
                <div>
                    <h1>${data.name}</h1>
                    <p>${data.status}${data.statusText ? " | "+data.statusText : ""}</p>
                    <div id="userProfileBtns" style="margin-top: 10px;"></div>
                </div>
            </div>
            <div id="userProfileActivity"></div>
            <div id="userProfileAbout"></div>
        `.trim();

        if(data.statusText) render_realm.realmUserStatus(data._id, { status: data.statusText });

        if(!targetIsMe){
            const frinedBtn = document.createElement("button");
            frinedBtn.classList.add("btn");
            let frinedBtnText: string;
            switch(data.friendStatus){
                case Core_socket__friendStatus.NOT_FRIEND:
                    frinedBtnText = LangPkg.ui.friend.add;
                    frinedBtn.onclick = () => mainViewInteract.addFriend(data._id);
                break;
                case Core_socket__friendStatus.IS_FRIEND:
                    frinedBtnText = LangPkg.ui.friend.remove;
                    frinedBtn.onclick = () => mainView.removeFriend(data._id);
                break;
                case Core_socket__friendStatus.REQUEST_SENT:
                    frinedBtnText = LangPkg.ui.friend.request_sent;
                    frinedBtn.onclick = () => mainView.removeFriendRequest(data._id);
                break;
                case Core_socket__friendStatus.REQUEST_RECEIVED:
                    frinedBtnText = LangPkg.ui.friend.request_received;
                    frinedBtn.onclick = () => {
                        coreFunc.changeChat("main");
                        mainView.changeView("requests");
                    }
                break;
            }
            frinedBtn.innerHTML = frinedBtnText;
            renderHTML.userProfile.querySelector("#userProfileBtns").appendChild(frinedBtn);
            
            const blockBtn = document.createElement("button");
            blockBtn.classList.add("btn");
            blockBtn.style.marginLeft = "10px";
            blockBtn.innerHTML = data.isBlocked ? LangPkg.ui.friend.unblock : LangPkg.ui.friend.block;
            blockBtn.onclick = () => {
                data.isBlocked = !data.isBlocked;
                socket.emit("dm.block", data._id, data.isBlocked);
            }
            renderHTML.userProfile.querySelector("#userProfileBtns").appendChild(blockBtn);
        }

        const activityDiv = renderHTML.userProfile.querySelector("#userProfileActivity");
        if(data.activity?.state){
            const act = data.activity;
            activityDiv.innerHTML = `
                <h2>Activity</h2>
                <p>${act.state} | ${act.name}</p>
                ${act.details ? "<p>" + act.details + "</p>" : ""}
                ${act.startTime ? '<p>Time: <span id="userProfileActivityTime"></span></p>' : ""}
                ${
                    act.party ?
                        "<p>Party: "+
                            act.party.id + " | " +
                            act.party.state +
                            (act.party.max ? " / " + act.party.max : "") +
                        "</p>"
                    : ""}
            `.trim();
            
            render_realm.realmUserStatus(data._id, { activity: utils.rmRef(act) });

            if(act.startTime){
                const timeP = activityDiv.querySelector("#userProfileActivityTime");
                function update(){
                    const time = new Date().getTime() - new Date(act.startTime).getTime();
                    const hours = Math.floor(time / 1000 / 60 / 60);
                    const minutes = Math.floor(time / 1000 / 60) - (hours * 60);
                    const seconds = Math.floor(time / 1000) - (hours * 60 * 60) - (minutes * 60);
                    timeP.innerHTML = `${hours}:${minutes}:${seconds}`;
                }
                let interval = setInterval(() => {
                    if(!timeP) return clearInterval(interval);
                    update();    
                }, 1000);
                update();
            }
        }

        renderUtils.initPopup(renderHTML.userProfile);
    },
}

export default render_user;