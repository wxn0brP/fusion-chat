import apis from "#apis";
import { $store } from "#store";

const messStyle = {
    styleMessReacts(reactsDiv: HTMLElement) {
        const spans = reactsDiv.querySelectorAll("span");
        spans.forEach(span => {
            const users = span.getAttribute("_users").split(",");

            if (users.length == 0 || users[0] == "") {
                span.remove();
                return;
            }

            span.classList.remove("userReacted");
            if (users.includes($store.user._id.get())) {
                span.classList.add("userReacted");
            }

            span.title = users.map(u => apis.www.changeUserID(u)).join(", ");
            span.innerHTML = span.getAttribute("_key") + " " + users.length;
        });
    },
}

export default messStyle;