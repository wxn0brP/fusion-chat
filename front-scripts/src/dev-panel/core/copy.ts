import Id from "../types/Id";

function copy(text: string) {
    navigator.clipboard.writeText(text)
    .then(() => alert("Copied to clipboard"))
    .catch(() => alert(text))
}

export function copyId(id: Id) {
    copy(id)
}

export function copyInvite(id: Id) {
    const inv = location.origin + "/iv/bot?id=" + id;
    copy(inv)
}

(window as any).copy = {
    id: copyId,
    invite: copyInvite
}