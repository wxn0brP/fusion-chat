import apis from "#apis";
import contextMenu from "#components/modal/contextMenu";
import { syncManager } from "#socket/sync";
import { socketFetch } from "#socket/utils";
import { $store } from "#store";
import { UiComponent } from "#types/component";
import { Vars_realms } from "#types/var";
import { changeToRealm } from "#features/mess";

class RealmsView implements UiComponent {
    element: HTMLDivElement;

    render(): void {
        this.element.innerHTML = "";
        const data = $store.realms.get();
        data.forEach((realm) => {
            const id = realm.realm;
            const realmDiv = document.createElement("div");
            realmDiv.classList.add("realm");
            realmDiv.id = "realm_chat_" + id;
            if (realm.img) {
                realmDiv.innerHTML = `<img src="/userFiles/realms/${id}.png?time=${Date.now()}" alt="${apis.www.changeChat(id)}">`;
            } else {
                realmDiv.innerHTML = apis.www.changeChat(id);
            }
            this.element.appendChild(realmDiv);

            realmDiv.addEventListener("click", () => {
                changeToRealm(id);
            });

            contextMenu.menuClickEvent(realmDiv, (e) => {
                contextMenu.realm(e, id);
            });
        });
        // coreFunc.markSelectedChat();
    }

    mount(): void {
        this.element = document.querySelector("#realms__content");

        $store.realms.subscribe(this.render.bind(this));

        syncManager.register(async () => {
            const [realms] = await socketFetch<[Vars_realms[]]>("realm.get");
            $store.realms.set(realms);
        });
    }
}

const realmsView = new RealmsView();
export default realmsView;