import"../../account-confirm-s442mjqq.js";var r=new URLSearchParams(window.location.search),n=r.get("token");if(!n)qs("#err").innerHTML="Token is required.";fetch("/api/account/delete/get?token="+n).then((e)=>e.json()).then((e)=>{if(e.err)return qs("#err").innerHTML=e.msg;qs("#user").innerHTML=e.name});qs("button").addEventListener("click",()=>{let e=new XMLHttpRequest;e.open("POST","/api/account/delete/undo",!1),e.setRequestHeader("Content-Type","application/json"),e.send(JSON.stringify({token:n}));let t=JSON.parse(e.responseText);if(t.err)return qs("#err").innerHTML=t.msg;location.href="/"});

//# debugId=9AC9B29B6149BAF264756E2164756E21
//# sourceMappingURL=account-undo.js.map
