import hub from "../../hub";
hub("render/utils");

import Id from "../../types/Id";
import utils from "../../utils/utils";
import { Utils_updater } from "../../types/utils";
import apiVars from "../../var/api";

const renderUtils = {
    sortPrivs(data: Id[]): Id[] {
        const sortedData = [...data];
        sortedData.sort((a, b) => {
            const la = apiVars.lastMess["$" + a]?.main;
            const lb = apiVars.lastMess["$" + b]?.main;
            if (!la || !lb) return 0;

            return utils.extractTimeFromId(lb.mess) - utils.extractTimeFromId(la.mess);
        });

        return sortedData;
    },

    initPopup(popup: HTMLElement) {
        if (!popup) return;

        const isAlreadyOpen = popup.getAttribute("opened");
        if (isAlreadyOpen) {
            popup.setAttribute("opened", "2");
            return;
        }

        popup.setAttribute("opened", "1");
        popup.fadeIn();

        const closePopup = () => {
            setTimeout(() => {
                const isPopupStillOpen = popup.getAttribute("opened") === "2";
                if (isPopupStillOpen) {
                    popup.setAttribute("opened", "1");
                    return;
                }
                popup.fadeOut();
                document.body.removeEventListener("click", closePopup);
                setTimeout(() => {
                    popup.removeAttribute("opened");
                }, 800);
            }, 100);
        };

        setTimeout(() => {
            document.body.addEventListener("click", closePopup);
        }, 100);
    },

    createUpdater<T>(cb: (value: T) => void, initialValue: T): Utils_updater<T> {
        return {
            _value: initialValue,
            get() {
                return this._value;
            },
            set(newValue) {
                this._value = newValue;
                cb(newValue);
            }
        }
    },
}

export default renderUtils;