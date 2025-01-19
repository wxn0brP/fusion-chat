import deleteAccount from "./deleteAccount";

const actions = {
    deleteAccount
}

export default actions;
export type Actions = keyof typeof actions;