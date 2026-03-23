import"../../account-confirm-s442mjqq.js";var i=new URLSearchParams(window.location.search),n=i.get("token");if(!n)qs("#err").innerHTML="Token is required.";qs("form").addEventListener("submit",(t)=>{t.preventDefault();let r=qi("#pass").value;if(!r)return qs("#err").innerHTML="Password is required.";let e=new XMLHttpRequest;e.open("POST","/api/account/delete/confirm",!1),e.setRequestHeader("Content-Type","application/json"),e.send(JSON.stringify({pass:r,token:n}));let s=JSON.parse(e.responseText);if(s.err)return qs("#err").innerHTML=s.msg;location.href="/"});

//# debugId=02889CAF126EB93964756E2164756E21
//# sourceMappingURL=account-confirm.js.map
