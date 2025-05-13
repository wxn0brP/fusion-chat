import globalExpose from "#bus";
import { $store } from "#store";
import { UiComponent } from "#types/component";
import { Vars_mainView__page } from "#types/var";

class MainView implements UiComponent {
    element: HTMLDivElement;

    render() { }

    changeView(view: Vars_mainView__page) {
        $store.ui.mainView.view.set(view);
    }

    mount(): void {
        this.element = document.querySelector("#main__view");

        $store.ui.mainView.open.subscribe((open) => {
            this.element.style.display = open ? "" : "none";
        });

        setTimeout(() => {
            this.changeView("all");
        }, 100);
    }
}

const mainView = new MainView();
export default mainView;

globalExpose("ui", "mainView", mainView);