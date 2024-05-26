const loginDiv = document.querySelector("#login");
const emailDiv = document.querySelector("#email");
const errDiv = document.querySelector("#err");


function validAll(){
    let login = loginDiv.value;
    if(!login) return { err: "Login is required." };
    if(!/^[a-zA-Z0-9]+$/.test(login)) return { err: "Login can only contain letters and numbers." };

    login = login.trim();
    if(login.length < 3 || login.length > 10) return { err: "Login must be between 3 and 10 characters." };

    let email = emailDiv.value;
    if(!email) return { err: "Email is required." };
    email = email.trim();

    let pass1 = pass1Div.value;
    if(!pass1) return { err: "Password is required." };
    pass1 = pass1.trim();

    let pass2 = pass2Div.value;
    if(!pass2) return { err: "Confirm Password is required." };
    pass2 = pass2.trim();

    if(pass1 != pass2) return { err: "Passwords do not match." };

    if(getStrength(passTest(pass1)) != 5) return { err: "Password strength is not sufficient." }; // 5 = tests length

    return {
        login,
        password: pass1,
        email
    };
}

document.querySelector("form").addEventListener("submit", (e) => {
    e.preventDefault();

    const inputs = validAll();
    if(inputs.err)
        return errDiv.innerHTML = inputs.err;

    const { login, password, email } = inputs;

    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/register", false);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify({ name: login, password, email }));
    const res = JSON.parse(xhr.responseText);
    if(res.err)
        return errDiv.innerHTML = res.msg;
    location.href = "/register-code";
});