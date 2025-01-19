import db from "./dataBase";

process.on("uncaughtException", (e) => {
    try{
        console.error("Uncaught Exception: ", e);
        db.logs.add("uncaughtException", {
            error: e.message,
            stackTrace: e.stack
        });
    }catch(e){
        console.error("Critical error: ", e);
    }
});

process.on('unhandledRejection', (reason, promise) => {
    try{
        console.error("Unhandled Rejection: ", reason);
        db.logs.add("unhandledRejection", {
            reason: reason,
            promise: promise
        })
    }catch(e){
        console.error("Critical error: ", e);
    }
});