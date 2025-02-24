import vars from "./var/var";
import socket from "./core/ws";

socket.connect();
const userImg = document.querySelector<HTMLImageElement>("#header__user__img");
userImg.src = "/api/profile/img?id=" + vars.user._id;
userImg.title = "Logged as " + vars.user.fr;