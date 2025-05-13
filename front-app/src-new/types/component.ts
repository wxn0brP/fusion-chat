export interface UiComponent {
    element: HTMLElement;
    render(): void;
    mount(): void;
}