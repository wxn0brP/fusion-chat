import admin from "firebase-admin";
import fs from "fs";

try{
    const serviceAccount = JSON.parse(fs.readFileSync("config/firebase.json", "utf8"));
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}catch{}

global.firebaseAdmin = admin;

global.fireBaseMessage = {
    async send(to, title, body){
        const socket = global.getSocket(to);
        if(socket.length > 0) return;
    
        let tokens = await global.db.data.find("fireBaseUser", { _id: to });
        if(tokens.length == 0) return;
        tokens = tokens.map(t => t.token);
        
        try{
            tokens.forEach(async token => {
                try{
                    await global.firebaseAdmin.messaging().send({
                        notification: { title, body },
                        token,
                    });
                }catch{}
            })
        }catch{}
    },
}