import "@wxn0brp/flanker-ui/html";
import vars from "./var/var";
import socket from "./core/ws";
import "./core/copy";

socket.connect();
const userImg = qs<HTMLImageElement>("#header__user__img");
userImg.src = "/api/profile/img?id=" + vars.user._id;
userImg.title = "Logged as " + vars.user.fr;