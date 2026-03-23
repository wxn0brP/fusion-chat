import"../../account-confirm-s442mjqq.js";var i=qi("#code"),t=qs("#err");qs("form").addEventListener("submit",(s)=>{s.preventDefault();let r=i.value;if(!r)return t.innerHTML="Code is required.";let e=new XMLHttpRequest;e.open("POST","/api/register/verify",!1),e.setRequestHeader("Content-Type","application/json"),e.send(JSON.stringify({code:r}));let n=JSON.parse(e.responseText);if(n.err)return t.innerHTML=n.msg;location.href="/login"});

//# debugId=C3D465D90C792A4764756E2164756E21
//# sourceMappingURL=register-code.js.map
