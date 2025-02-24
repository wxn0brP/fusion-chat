declare global {
    interface HTMLElement {
        html(v?: string): string | HTMLElement;
        on(event: string, fn: EventListenerOrEventListenerObject): void;
        css(style: string | Record<string, string>, val?: string | null): void;
        attrib(att: string, arg?: string | null): string | HTMLElement;
        clA(arg: string): HTMLElement;
        clR(arg: string): HTMLElement;
        clT(className: string): HTMLElement;
        animateFade(from: number, options?: { time?: number; cb?: () => void }): HTMLElement;
        fadeIn(display?: string | (() => void), cb?: () => void): HTMLElement;
        fadeOut(cb?: () => void): HTMLElement;
        fadeToggle(): HTMLElement;
        add(child: HTMLElement): HTMLElement;
        addUp(child: HTMLElement): HTMLElement;
        fade: boolean;
    }

    interface HTMLInputElement {
        v(v?: string): string | HTMLInputElement;
    }

    var lo: typeof console.log;
    var delay: (ms: number) => Promise<void>;
}

export {}