(async function start(){
    await apis.app.init();
    debugFunc.init();

    coreFunc.changeChat("main");
    translateFunc.init();
    socket.connect();
})();