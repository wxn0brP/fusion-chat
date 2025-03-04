import hub from "../../hub";
import { Ui_Media__Options, Ui_Media__State } from "../../types/ui/components";
import LangPkg from "../../utils/translate";
import { mglInt } from "../../var/mgl";
hub("components/media");

const mediaPopupDiv = document.querySelector<HTMLElement>("#mediaPopup");

class MediaPopup {
    private container: HTMLElement;
    private url: string;
    private options: Required<Ui_Media__Options>;
    private state: Ui_Media__State;
    private overlay: HTMLElement;
    private content: HTMLElement;
    private media: HTMLImageElement | HTMLVideoElement;
    private controlsResets: (() => void)[] = [];

    constructor(container: HTMLElement, url: string, options: Ui_Media__Options) {
        this.container = container;
        this.url = url;
        this.options = {
            maxScale: options.maxScale || 10,
            minScale: options.minScale || 0.1,
            scaleStep: options.scaleStep || 0.1,
            rotationStep: options.rotationStep || 15,
            doubleTapDelay: options.doubleTapDelay || 300,
            isVideo: "auto",
            ...options
        };

        this.state = {
            scale: 1,
            rotation: 0,
            position: { x: 0, y: 0 },
            brightness: 100,
            contrast: 100,
            saturation: 100,
            blur: 0,
            isDragging: false,
            dragStart: { x: 0, y: 0 },
            lastTap: 0,
            lastTapPosition: { x: 0, y: 0 },
            initialPinchDistance: null,
            initialRotation: null,
            previousTouches: null,
            isAnimating: false
        };

        this.init();
    }

    private init() {
        this.overlay = document.createElement("div");
        this.overlay.className = "media-popup-overlay";
        this.overlay.fadeIn("");

        this.content = document.createElement("div");
        this.content.className = "media-popup-content";

        let isVideo = this.options.isVideo;
        if (isVideo === "auto") isVideo = /\.(mp4|webm|ogg|mkv|webm|avi)$/i.test(this.url);

        this.media = document.createElement(isVideo ? "video" : "img");
        this.media.className = "media-popup-media";
        this.media.src = this.url;
        // @ts-ignore if isVideo media will be video
        if (isVideo) this.media.controls = true;

        const controls = document.createElement("div");
        controls.className = "media-popup-controls";

        this.controlsResets = [];
        const lang = LangPkg.media;
        this.addControlGroup(controls, [
            { icon: lang.zoom + "+", action: () => this.zoom(1 + this.options.scaleStep), title: lang.zoom_in },
            { icon: lang.zoom + "-", action: () => this.zoom(1 - this.options.scaleStep), title: lang.zoom_out },
            { icon: lang.rotate + " <", action: () => this.rotate(-this.options.rotationStep), title: lang.rotate_left },
            { icon: lang.rotate + " >", action: () => this.rotate(this.options.rotationStep), title: lang.rotate_right },
            { icon: lang.flip, action: () => this.flip(), title: lang.flip },
            { icon: lang.reset, action: () => this.resetTransforms(), title: lang.reset_transforms },
            { icon: "✖", action: () => this.close(), title: LangPkg.uni.close }
        ]);

        controls.appendChild(document.createElement("br"));

        const sliders = document.createElement("div");
        sliders.className = "media-popup-sliders";
        this.addSlider(sliders, "brightness", lang.brightness, 0, 200);
        this.addSlider(sliders, "contrast", lang.contrast, 0, 200);
        this.addSlider(sliders, "saturation", lang.saturation, 0, 200);
        this.addSlider(sliders, "blur", lang.blur, 0, 10);
        controls.appendChild(sliders);

        this.content.appendChild(this.media);
        this.overlay.appendChild(this.content);
        this.overlay.appendChild(controls);
        this.container.appendChild(this.overlay);

        this.setupEventListeners();
        this.updateTransform();
    }

    private addControlGroup(container: HTMLElement, controls: { icon: string, action: () => void, title: string }[]) {
        const group = document.createElement("div");
        group.className = "media-popup-control-group";

        controls.forEach(ctrl => {
            const button = document.createElement("button");
            button.className = "media-popup-btn";
            button.textContent = ctrl.icon;
            button.title = ctrl.title;
            button.onclick = ctrl.action;
            group.appendChild(button);
        });

        container.appendChild(group);
    }

    private addSlider(container: HTMLElement, property: string, icon: string, min: number, max: number) {
        const sliderContainer = document.createElement("div");
        sliderContainer.className = "media-popup-slider-container";

        const iconSpan = document.createElement("span");
        iconSpan.textContent = icon;

        const slider = document.createElement("input");
        slider.type = "range";
        slider.className = "media-popup-slider";
        slider.min = min.toString();
        slider.max = max.toString();
        const defaultValue = this.state[property] ?? 100;
        slider.value = defaultValue;
        this.controlsResets.push(() => slider.value = defaultValue);

        const value = document.createElement("span");
        value.className = "media-popup-value";
        value.textContent = slider.value;

        slider.addEventListener("input", (e) => {
            const target = e.target as HTMLInputElement;
            this.state[property] = target.value;
            value.textContent = target.value;
            this.updateFilters();
        });

        sliderContainer.appendChild(iconSpan);
        sliderContainer.appendChild(slider);
        sliderContainer.appendChild(value);
        container.appendChild(sliderContainer);
    }

    private setupEventListeners() {
        this.content.addEventListener("wheel", (e: WheelEvent) => {
            e.preventDefault();
            const delta = e.deltaY > 0 ? -this.options.scaleStep : this.options.scaleStep;
            this.zoom(1 + delta);
        });

        document.addEventListener("keydown", (e: KeyboardEvent) => {
            if (e.key === "Escape") this.close();
            if (e.key === "+") this.zoom(1 + this.options.scaleStep);
            if (e.key === "-") this.zoom(1 - this.options.scaleStep);
            if (e.key === "ArrowLeft") this.rotate(-this.options.rotationStep);
            if (e.key === "ArrowRight") this.rotate(this.options.rotationStep);
        });

        this.media.addEventListener("mousedown", this.handleMouseDown.bind(this));
        document.addEventListener("mousemove", this.handleMouseMove.bind(this));
        document.addEventListener("mouseup", this.handleMouseUp.bind(this));

        this.media.addEventListener("touchstart", this.handleTouchStart.bind(this), { passive: false });
        this.media.addEventListener("touchmove", this.handleTouchMove.bind(this), { passive: false });
        this.media.addEventListener("touchend", this.handleTouchEnd.bind(this));
        this.media.addEventListener("touchcancel", this.handleTouchEnd.bind(this));
    }

    private handleMouseDown(e: MouseEvent) {
        e.preventDefault();
        this.state.isDragging = true;
        this.state.dragStart = {
            x: e.clientX - this.state.position.x,
            y: e.clientY - this.state.position.y
        };
    }

    private handleMouseMove(e: MouseEvent) {
        if (!this.state.isDragging) return;

        this.state.position = {
            x: e.clientX - this.state.dragStart.x,
            y: e.clientY - this.state.dragStart.y
        };

        this.updateTransform();
    }

    private handleMouseUp() {
        this.state.isDragging = false;
    }

    private handleTouchStart(e: TouchEvent) {
        e.preventDefault();
        const touches = e.touches;
        this.state.previousTouches = Array.from(touches).map(t => ({
            identifier: t.identifier,
            pageX: t.pageX,
            pageY: t.pageY
        }));

        if (touches.length === 1) {
            const touch = touches[0];
            const now = Date.now();
            const lastTap = this.state.lastTap;
            const lastTapPosition = this.state.lastTapPosition;

            if (now - lastTap < this.options.doubleTapDelay &&
                this.getDistance(
                    { x: touch.pageX, y: touch.pageY },
                    lastTapPosition
                ) < 30) {
                this.handleDoubleTap(touch);
            }

            this.state.lastTap = now;
            this.state.lastTapPosition = { x: touch.pageX, y: touch.pageY };
            this.startDrag(touch);

        } else if (touches.length === 2) {
            this.state.initialPinchDistance = this.getPinchDistance(touches);
            this.state.initialRotation = this.getRotationAngle(touches);
            this.state.isDragging = false;
        }
    }

    private handleTouchMove(e: TouchEvent) {
        e.preventDefault();
        const touches = e.touches;

        if (!this.state.previousTouches) return;

        if (touches.length === 1 && this.state.isDragging) {
            this.drag(touches[0]);

        } else if (touches.length === 2) {
            const currentDistance = this.getPinchDistance(touches);
            const currentRotation = this.getRotationAngle(touches);

            if (this.state.initialPinchDistance > 0) {
                const scale = currentDistance / this.state.initialPinchDistance;
                this.handlePinch(scale);
            }

            if (this.state.initialRotation !== null) {
                const rotation = currentRotation - this.state.initialRotation;
                this.handleRotation(rotation);
            }

            this.state.previousTouches = Array.from(touches).map(t => ({
                identifier: t.identifier,
                pageX: t.pageX,
                pageY: t.pageY
            }));
        }
    }

    private handleTouchEnd(e: TouchEvent) {
        e.preventDefault();

        if (e.touches.length === 0) {
            this.state.isDragging = false;
            this.state.initialPinchDistance = null;
            this.state.initialRotation = null;
            this.state.previousTouches = null;
        }
    }

    private handleDoubleTap(touch: Touch) {
        const zoomFactor = this.state.scale > 1 ? 1 : 2;
        this.zoom(zoomFactor, touch.pageX, touch.pageY);
    }

    private startDrag(touch: Touch) {
        this.state.isDragging = true;
        this.state.dragStart = {
            x: touch.pageX - this.state.position.x,
            y: touch.pageY - this.state.position.y
        };
    }

    private drag(touch: Touch) {
        this.state.position = {
            x: touch.pageX - this.state.dragStart.x,
            y: touch.pageY - this.state.dragStart.y
        };
        this.updateTransform();
    }

    private handlePinch(scale: number) {
        this.zoom(scale);
    }

    private handleRotation(angle: number) {
        this.state.rotation = angle;
        this.updateTransform();
    }

    private zoom(scaleFactor: number, centerX: number | undefined = undefined, centerY: number | undefined = undefined) {
        const newScale = this.state.scale * scaleFactor;

        if (newScale < this.options.minScale || newScale > this.options.maxScale) return;

        if (centerX !== undefined && centerY !== undefined) {
            this.state.position.x += (this.media.clientWidth / 2 - centerX) * (1 - scaleFactor);
            this.state.position.y += (this.media.clientHeight / 2 - centerY) * (1 - scaleFactor);
        }

        this.state.scale = newScale;
        this.updateTransform();
    }

    private rotate(angle: number) {
        this.state.rotation += angle;
        this.updateTransform();
    }

    private flip() {
        this.state.rotation += 180;
        this.updateTransform();
    }

    private resetTransforms() {
        this.state = {
            ...this.state,
            scale: 1,
            rotation: 0,
            position: { x: 0, y: 0 },
            brightness: 100,
            contrast: 100,
            saturation: 100,
            blur: 0,
        };
        this.updateFilters();
        this.updateTransform();
        this.controlsResets.forEach(r => r());
    }

    private updateTransform() {
        this.media.style.transform = `
        translate(${this.state.position.x}px, ${this.state.position.y}px)
        scale(${this.state.scale})
        rotate(${this.state.rotation}deg)
      `;
    }

    private updateFilters() {
        this.media.style.filter = `
        brightness(${this.state.brightness}%)
        contrast(${this.state.contrast}%)
        saturate(${this.state.saturation}%)
        blur(${this.state.blur}px)
      `;
    }

    private close() {
        const _this = this;
        this.overlay.fadeOut(() => _this.container.removeChild(_this.overlay));
    }

    private getPinchDistance(touches: TouchList) {
        const dx = touches[0].pageX - touches[1].pageX;
        const dy = touches[0].pageY - touches[1].pageY;
        return Math.sqrt(dx * dx + dy * dy);
    }

    private getRotationAngle(touches: TouchList) {
        return Math.atan2(
            touches[1].pageY - touches[0].pageY,
            touches[1].pageX - touches[0].pageX
        ) * (180 / Math.PI);
    }

    private getDistance(p1: { x: number, y: number }, p2: { x: number, y: number }) {
        return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
    }
}

function createMediaPopup(media: string, options = {}) {
    return new MediaPopup(mediaPopupDiv, media, options);
}

export default createMediaPopup;
export { MediaPopup };
mglInt.createMediaPopup = createMediaPopup;