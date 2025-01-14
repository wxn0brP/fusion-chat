import admin from "firebase-admin";
import fs from "fs";
import db from "./dataBase.js";

try{
    const serviceAccount = JSON.parse(fs.readFileSync("config/firebase.json", "utf8"));
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}catch{}

global.firebaseAdmin = admin;

global.fireBaseMessage = {
    async send(options){
        if(!options) return false;

        const {
            to,
            title,
            body,
            checkSocket=false,
            action=null,
        } = options;

        if(!to) return false;
        if(!title) return false;
        if(!body) return false;

        if(checkSocket){
            const socket = global.getSocket(to);
            if(socket.length > 0) return;
        }
    
        let tokens = await db.data.find("fireToken", { user: to });
        if(tokens.length == 0) return;

        const workedTokens = [];
        for(const data of tokens){
            const rm = async () => await db.data.removeOne("fireToken", data);

            const exp = data.exp;
            if(exp * 1000 < Date.now()){
                await rm();
                continue;
            }

            const tokenLogged = await db.data.findOne("token", { token: data.fc });
            if(!tokenLogged){
                await rm();
                continue;
            }

            workedTokens.push(data.fire);
        }

        try{
            workedTokens.forEach(token => {
                try{
                    const message = {
                        notification: { title, body },
                        token,
                        data: action ? { action: JSON.stringify(action)} : undefined
                    }
                    global.firebaseAdmin.messaging().send(message);
                }catch(e){
                    if(process.env.NODE_ENV == "development") lo("Firebase error: ", e.message);
                }
            })
        }catch{}
    },
}