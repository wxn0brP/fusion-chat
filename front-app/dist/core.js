globalThis.lo = console.log;
globalThis.delay = (ms) => new Promise(res => setTimeout(res, ms));
export const cw = {
    proto: {
        html(v) {
            if (v !== undefined) {
                this.innerHTML = v;
                return this;
            }
            else {
                return this.innerHTML;
            }
        },
        v(v) {
            if (v !== undefined) {
                this.value = v;
                return this;
            }
            else {
                return this.value;
            }
        },
        on(event, fn) {
            this.addEventListener(event, fn);
        },
        css(style, val = null) {
            if (typeof style === "string") {
                if (val !== null) {
                    this.style[style] = val;
                }
                else {
                    this.style.cssText = style;
                }
            }
            else {
                Object.assign(this.style, style);
            }
        },
        attrib(att, arg = null) {
            if (arg !== null) {
                this.setAttribute(att, arg);
                return this;
            }
            else {
                return this.getAttribute(att) || "";
            }
        },
        clA(arg) {
            this.classList.add(arg);
            return this;
        },
        clR(arg) {
            this.classList.remove(arg);
            return this;
        },
        clT(className) {
            this.classList.toggle(className);
            return this;
        },
        animateFade(from, options = {}) {
            const { time = 200, cb } = options;
            const style = this.style;
            const steps = 50;
            const timeToStep = time / steps;
            const d = (from === 0 ? 1 : -1) / steps;
            let index = 0;
            style.opacity = from.toString();
            const interval = setInterval(() => {
                if (index >= steps) {
                    clearInterval(interval);
                    cb?.();
                    return;
                }
                style.opacity = (parseFloat(style.opacity || "0") + d).toString();
                index++;
            }, timeToStep);
            return this;
        },
        fadeIn(display = "block", cb) {
            if (typeof display === "function") {
                cb = display;
                display = "block";
            }
            this.css("display", display);
            this.animateFade(0, { cb });
            this.fade = true;
            return this;
        },
        fadeOut(cb) {
            this.animateFade(1, { time: 300, cb });
            setTimeout(() => this.css("display", "none"), 300);
            this.fade = false;
            return this;
        },
        fadeToggle() {
            if (this.fade) {
                this.fadeOut();
            }
            else {
                this.fadeIn();
            }
            return this;
        },
        add(child) {
            this.appendChild(child);
            return this;
        },
        addUp(child) {
            this.insertBefore(child, this.firstChild);
            return this;
        },
        fade: true,
    },
    init() {
        Object.assign(HTMLElement.prototype, this.proto);
    },
    rand(min, max) {
        return Math.round(Math.random() * (max - min) + min);
    },
    round(a, b) {
        const factor = Math.pow(10, b);
        return Math.round(a * factor) / factor;
    },
    get(url) {
        if (!url)
            return "";
        const xhr = new XMLHttpRequest();
        xhr.open("GET", url, false);
        xhr.send();
        if (xhr.status === 200) {
            return xhr.responseText;
        }
        else if (xhr.status === 404) {
            return "";
        }
        else {
            return "";
        }
    },
};
cw.init();
export default cw;
//# sourceMappingURL=core.js.map