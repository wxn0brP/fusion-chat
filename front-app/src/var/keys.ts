import hub from "../hub";
hub("var/keys");

export const KeyState = {
    shift: false,
    ctrl: false,
    alt: false,
}
export default KeyState;

document.addEventListener("keydown", (e) => {
    KeyState.shift = e.shiftKey;
    KeyState.ctrl = e.ctrlKey;
    KeyState.alt = e.altKey;
});

document.addEventListener("keyup", (e) => {
    KeyState.shift = e.shiftKey;
    KeyState.ctrl = e.ctrlKey;
    KeyState.alt = e.altKey;
});