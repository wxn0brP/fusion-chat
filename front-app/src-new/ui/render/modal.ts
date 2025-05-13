import modalView from "#components/app/modal.view";
import LangPkg from "#utils/translate";

export interface ModalOptions {
    title: string;
    onSubmit: (value: string, opts?: any) => void;
    inputPlaceholder?: string;
    buttonLabel?: string;
    required?: boolean;
};

export function createModal({ title, inputPlaceholder, buttonLabel, onSubmit, required }: ModalOptions, opts?: any) {
    return (root: HTMLDivElement) => {
        root.innerHTML = `
            <h3 style="margin-bottom: 10px;">${title}</h3>
            <input data-id="input" type="text" placeholder="${inputPlaceholder || ""}" class="btn" />
            <br />
            <button data-id="submit" class="btn" style="margin-top: 10px;">${buttonLabel || LangPkg.uni.ok}</button>
        `;

        const input = root.querySelector("[data-id=input]") as HTMLInputElement;
        const submitButton = root.querySelector("[data-id=submit]") as HTMLButtonElement;

        input.focus();

        input.onkeydown = (e) => {
            if (e.key === "Enter") {
                e.preventDefault();
                submitButton.click();
            }
        };

        submitButton.onclick = () => {
            const value = input.value;
            if (required && !value) return;
            if (!required && !value) return modalView.close();
            onSubmit(value, opts);
            modalView.close();
        };
    };
}
