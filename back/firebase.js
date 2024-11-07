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
    
        let tokens = await global.db.data.find("fireToken", { user: to });
        if(tokens.length == 0) return;

        const workedTokens = [];
        for(const data of tokens){
            const rm = async () => await global.db.data.removeOne("fireToken", data);

            const exp = data.exp;
            if(exp * 1000 < Date.now()){
                await rm();
                continue;
            }

            const tokenLoged = await global.db.data.findOne("token", { token: data.fc });
            if(!tokenLoged){
                await rm();
                continue;
            }

            workedTokens.push(data.fire);
        }
        
        try{
            workedTokens.forEach(token => {
                try{
                    global.firebaseAdmin.messaging().send({
                        notification: { title, body },
                        token,
                    });
                }catch(e){
                    if(process.env.status == "dev") lo("Firebase error: ", e.message);
                }
            })
        }catch{}
    },
}