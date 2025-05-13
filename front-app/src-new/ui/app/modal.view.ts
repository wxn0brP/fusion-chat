import globalExpose from "#bus";
import { UiComponent } from "#types/component";

export type ModalCreate = (root: HTMLDivElement, data?: any) => void;

class ModalView implements UiComponent {
    element: HTMLDivElement;
    content: HTMLDivElement;

    registered: Record<string, () => ModalCreate> = {};

    render(): void { }

    register(name: string, showBuilder: () => ModalCreate): void {
        this.registered[name] = showBuilder;
    }

    show(name: string, data?: any): void {
        const render = this.registered[name];
        if (!render) return alert(`Modal ${name} not registered`);
        render()(this.content, data);
        if (this.element.style.display == "none") this.element.fadeIn();
    }

    close(): void {
        this.element.fadeOut(() => {
            this.content.innerHTML = "";
        });
    }

    mount(): void {
        this.element = document.querySelector("#modal");
        this.content = this.element.querySelector("#modal__content");
    }
}

const modalView = new ModalView();
export default modalView;
globalExpose("ui", "modal", modalView);