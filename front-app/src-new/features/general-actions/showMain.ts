import globalExpose from "#bus";
import { $store } from "#store";
import { changeChatVisibly } from "./chat";

globalExpose("ui", "mainOpen", () => {
    $store.chat.id.set("main");
    changeChatVisibly("main");
})