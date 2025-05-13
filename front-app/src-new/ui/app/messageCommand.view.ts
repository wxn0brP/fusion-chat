import { UiComponent } from "#types/component";

class MessageCommandView implements UiComponent {
    element: HTMLDivElement;

    render(): void {
        
    }

    mount(): void {
        this.element = document.querySelector("#barc__commads");

        this.element.style.display = "none";
    }
}

const messageCommandView = new MessageCommandView();
export default messageCommandView;