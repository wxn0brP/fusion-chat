(function(){
    if(debugFunc.isDebug) return;

    const warnings = [
        { txt: "Wait!", css: "60px;color:gold" },
        { txt: "If someone told you to copy and paste something here, there's a 110% chance they're trying to scam you.", css: "20px" },
        { txt: "Pasting anything here could give someone access to your Fusion Chat account and your messages.", css: "20px;color:red" },
        { txt: "Unless you fully understand what you're doing, close this window and stay safe.", css: "20px" }
    ];

    warnings.forEach(({ txt, css }) => {
        lo(`%c${translateFunc.get(txt)}`, `font-size:${css}`);
    });
})();