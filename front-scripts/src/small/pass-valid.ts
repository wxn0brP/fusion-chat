const meter = qi("#strength-meter");
export const pass1Div = qi("#pass1");
export const pass2Div = qi("#pass2");

pass1Div.addEventListener("input", checkPasswordStrength);

function checkPasswordStrength() {
    const password = pass1Div.value;
    const pass = passTest(password);

    updateRequirement("length-req", pass.lengthReq);
    updateRequirement("lowercase-req", pass.lowercaseReq);
    updateRequirement("uppercase-req", pass.uppercaseReq);
    updateRequirement("number-req", pass.numberReq);
    updateRequirement("special-req", pass.specialReq);

    meter.value = getStrength(pass).toString();
}

export function getStrength(pass: ReturnType<typeof passTest>) {
    const { lengthReq, lowercaseReq, uppercaseReq, numberReq, specialReq } = pass;
    const strength = [lengthReq, lowercaseReq, uppercaseReq, numberReq, specialReq].filter(Boolean).length;
    return strength;
}

function updateRequirement(requirementId: string, isFulfilled: boolean) {
    const requirementElement = qs("#" + requirementId);
    requirementElement.classList.remove("v");
    requirementElement.classList.remove("x");
    requirementElement.classList.add(isFulfilled ? "v" : "x");
}

export function passTest(password: string) {
    return {
        lengthReq: password.length >= 8,
        lowercaseReq: /[a-z]/.test(password),
        uppercaseReq: /[A-Z]/.test(password),
        numberReq: /[0-9]/.test(password),
        specialReq: /[^a-zA-Z0-9]/.test(password),
    }
}

checkPasswordStrength();

export function passVis(n: number) {
    let ele = qi("#pass" + n);
    ele.type = ele.type == "text" ? "password" : "text";
}