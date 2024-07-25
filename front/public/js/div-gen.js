const div_gen = document.querySelector("#div-gen");
function genDiv(){
    let div = document.createElement("div");
    div.classList.add("card");
    div_gen.appendChild(div);
}
for(let i=0; i<260; i++) genDiv();