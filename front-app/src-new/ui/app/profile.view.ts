import { syncManager } from "#socket/sync";
import { socketFetch } from "#socket/utils";
import { $store } from "#store";
import { UiComponent } from "#types/component";
import { Core_socket__user_status_type } from "#types/core/socket";

class ProfileView implements UiComponent {
    element: HTMLDivElement;

    render(): void {
        this.renderName($store.user.fr.get());
    }

    renderName(value: string): void {
        this.element.querySelector("#navs__user__name").innerHTML = value;
    }

    renderStatusText(): void {
        const text = $store.user.statusText.get() || $store.user.status.get() || "Online";
        this.element.querySelector("#navs__user__status").innerHTML = text;
    }

    mount(): void {
        this.element = document.querySelector("#navs__user");

        $store.user.fr.subscribe(this.renderName.bind(this));
        $store.user.status.subscribe(this.renderStatusText.bind(this));
        $store.user.statusText.subscribe(this.renderStatusText.bind(this));

        syncManager.register(async () => {
            const user = await socketFetch<[Core_socket__user_status_type, string]>("self.status.get");
            $store.user.status.set(user[0]);
            $store.user.statusText.set(user[1]);
        });

        this.render();
    }
}

const profileView = new ProfileView();
export default profileView;