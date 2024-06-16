const admin = require("firebase-admin");

try{
    const serviceAccount = require("../config/firebase.json");
    
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}catch{}

global.firebaseAdmin = admin;

global.fireBaseMessage = {
    async newMsgInfo(from, to_id, data){
        const socket = global.getSocket(to_id);
        if(socket.length > 0) return;
    
        let tokens = await global.db.data.find("fireBaseUser", { _id: to_id });
        if(tokens.length == 0) return;
        tokens = tokens.map(t => t.token);
        
        let title = "New message from "+from;
        let body = data.msg;
        
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
    }
}