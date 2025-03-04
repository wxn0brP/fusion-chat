export function updateUserProfileMarker(id, status) {
    const elements = document.querySelectorAll(`.userStatusMarker[data-status-id="${id}"]`);
    if (elements.length == 0)
        return;
    elements.forEach((ele) => ele.setAttribute("data-status", status || "offline"));
}
//# sourceMappingURL=userStatusMarker.js.map