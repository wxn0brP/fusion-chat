import { $store } from "#store";
import { Id } from "#types/base";

export function changeChatVisibly(id: Id) {
    if (id === "main") {
        $store.ui.bar.open.set(false);
        $store.ui.mainView.open.set(true);
        $store.ui.messages.open.set(false);
        $store.ui.navs.mainOpen.set(true);
        // $store
        return;
    }

    $store.ui.bar.open.set(true);
    $store.ui.mainView.open.set(false);
    $store.ui.messages.open.set(true);
    $store.ui.navs.mainOpen.set(id.startsWith("$"));
}