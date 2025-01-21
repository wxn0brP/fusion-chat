import deleteAccount from "./deleteAccount";
import event from "./event";

const actions = {
    deleteAccount,
    event,
}

export default actions;
export type Actions = keyof typeof actions;