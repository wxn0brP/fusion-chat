var i=qi("#strength-meter"),r=qi("#pass1"),R=qi("#pass2");r.addEventListener("input",a);function a(){let e=r.value,t=l(e);n("length-req",t.lengthReq),n("lowercase-req",t.lowercaseReq),n("uppercase-req",t.uppercaseReq),n("number-req",t.numberReq),n("special-req",t.specialReq),i.value=q(t).toString()}function q(e){let{lengthReq:t,lowercaseReq:s,uppercaseReq:c,numberReq:p,specialReq:o}=e;return[t,s,c,p,o].filter(Boolean).length}function n(e,t){let s=qs("#"+e);s.classList.remove("v"),s.classList.remove("x"),s.classList.add(t?"v":"x")}function l(e){return{lengthReq:e.length>=8,lowercaseReq:/[a-z]/.test(e),uppercaseReq:/[A-Z]/.test(e),numberReq:/[0-9]/.test(e),specialReq:/[^a-zA-Z0-9]/.test(e)}}a();function g(e){let t=qi("#pass"+e);t.type=t.type=="text"?"password":"text"}
export{r as b,R as c,q as d,l as e,g as f};

//# debugId=41DF583CA50AAFC264756E2164756E21
//# sourceMappingURL=account-confirm-wt8km065.js.map
