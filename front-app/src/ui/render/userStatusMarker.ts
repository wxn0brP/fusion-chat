import { Core_socket__user_status_type } from "../../types/core/socket";
import Id from "../../types/Id";

export function updateUserProfileMarker(id: Id, status: Core_socket__user_status_type) {
    const elements = document.querySelectorAll(`.userStatusMarker[data-status-id="${id}"]`);
    if (elements.length == 0) return;
    elements.forEach((ele) => ele.setAttribute("data-status", status || "offline"));
}