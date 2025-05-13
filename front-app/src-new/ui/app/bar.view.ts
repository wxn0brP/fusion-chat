import { $store } from "#store";
import { UiComponent } from "#types/component";
import LangPkg from "#utils/translate";
import utils from "#utils/utils";
import { sendMessage } from "#features/mess/send";

export const maxMessLen = 1000;

class BarView implements UiComponent {
    element: HTMLDivElement;
    input: HTMLInputElement;
    sendBtn: HTMLButtonElement;

    render() { }

    sendBtnStyle() {
        const len = this.input.value.trim().length;
        let prop = "";

        if (len == 0) prop = "grey";
        else if (len <= maxMessLen) prop = "green";
        else if (len > maxMessLen) prop = "red";

        this.sendBtn.style.setProperty("--fil", prop);
        this.sendBtn.disabled = len == 0 || len > maxMessLen;
    }

    messageHeight() {
        let len = this.input.value.split("\n").length - 1;
        len = len >= 2 ? Math.min(len, 20) : 0;
        this.input.style.setProperty("--messHeight", len + "rem");
    }

    focusInput(end: boolean = false) {
        if (utils.ss()) return;
        setTimeout(() => {
            this.input.focus();
            if (end) this.setSelectionStart();
        })
    }

    setSelectionStart(position?: number) {
        if (!position) position = this.input.value.length;
        this.input.setSelectionRange(position, position);
    }

    inputPlaceholder() {
        
    }

    mount(): void {
        this.element = document.querySelector("#bar");
        this.input = this.element.querySelector("#mess-input");
        this.sendBtn = this.element.querySelector("#barc__sendBtn__img");

        $store.ui.bar.open.subscribe((open) => {
            this.element.style.display = open ? "" : "none";
        });

        $store.chat.chnl.subscribe((id) => {
            let permToWrite = id === "main"; // if dm give permission
            if (id.startsWith("&")) {
                const tid = id.substring(1);
                const thread = $store.realm.threads.get().find(t => t._id == tid);
                if (thread) {
                    const chnl = $store.realm.chnlPerm.get()?.[thread.thread];
                    permToWrite = chnl?.threadWrite;
                }
            }
            else if (id.startsWith("^")) {
                permToWrite = $store.realm.chnlPerm.get()?.[id]?.threadWrite || false;
            }
            else if (id !== "main") {
                permToWrite = $store.realm.chnlPerm.get()?.[id]?.write || false;
            }

            this.input.placeholder = permToWrite ?
                LangPkg.ui.message.placeholder + "..." :
                LangPkg.ui.message.read_only + "!";
            this.input.disabled = !permToWrite;
        });

        setTimeout(() => {
            $store.ui.bar.open.set(false);
        }, 100);

        this.input.addEventListener("keyup", this.sendBtnStyle.bind(this));
        this.input.addEventListener("keyup", this.messageHeight.bind(this));
        this.input.addEventListener("keydown", (e) => {
            if (e.key != "Enter") return;
            if (e.shiftKey) return; //if shift + enter - new line

            e.preventDefault();
            sendMessage();
        });
        this.sendBtnStyle();
    }
}

const barView = new BarView();
export default barView;