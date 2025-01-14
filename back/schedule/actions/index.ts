import deleteAccount from "./deleteAccount.js";

const actions = {
    deleteAccount
}

export default actions;
export type Actions = keyof typeof actions;