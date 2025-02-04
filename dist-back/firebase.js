import admin from "firebase-admin";
import fs from "fs";
import db from "./dataBase.js";
try {
    const serviceAccount = JSON.parse(fs.readFileSync("config/firebase.json", "utf8"));
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}
catch { }
global.firebaseAdmin = admin;
global.fireBaseMessage = {
    async send(options) {
        if (!options)
            return false;
        const { to, title, body, checkSocket = false, action = null, } = options;
        if (!to)
            return false;
        if (!title)
            return false;
        if (!body)
            return false;
        if (checkSocket) {
            const socket = global.getSocket(to);
            if (socket.length > 0)
                return;
        }
        let tokens = await db.data.find("fireToken", { user: to });
        if (tokens.length == 0)
            return;
        const workedTokens = [];
        for (const data of tokens) {
            const rm = async () => await db.data.removeOne("fireToken", data);
            const exp = data.exp;
            if (exp * 1000 < Date.now()) {
                await rm();
                continue;
            }
            const tokenLogged = await db.data.findOne("token", { token: data.fc });
            if (!tokenLogged) {
                await rm();
                continue;
            }
            workedTokens.push(data.fire);
        }
        try {
            workedTokens.forEach(token => {
                try {
                    const message = {
                        notification: { title, body },
                        token,
                        data: action ? { action: JSON.stringify(action) } : undefined
                    };
                    global.firebaseAdmin.messaging().send(message);
                }
                catch (e) {
                    if (process.env.NODE_ENV == "development")
                        lo("Firebase error: ", e.message);
                }
            });
        }
        catch { }
    },
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmlyZWJhc2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9iYWNrL2ZpcmViYXNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sS0FBSyxNQUFNLGdCQUFnQixDQUFDO0FBQ25DLE9BQU8sRUFBRSxNQUFNLElBQUksQ0FBQztBQUNwQixPQUFPLEVBQUUsTUFBTSxZQUFZLENBQUM7QUFFNUIsSUFBRyxDQUFDO0lBQ0EsTUFBTSxjQUFjLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsWUFBWSxDQUFDLHNCQUFzQixFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUM7SUFDbkYsS0FBSyxDQUFDLGFBQWEsQ0FBQztRQUNoQixVQUFVLEVBQUUsS0FBSyxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDO0tBQ3BELENBQUMsQ0FBQztBQUNQLENBQUM7QUFBQSxNQUFLLENBQUMsQ0FBQSxDQUFDO0FBRVIsTUFBTSxDQUFDLGFBQWEsR0FBRyxLQUFLLENBQUM7QUFFN0IsTUFBTSxDQUFDLGVBQWUsR0FBRztJQUNyQixLQUFLLENBQUMsSUFBSSxDQUFDLE9BQU87UUFDZCxJQUFHLENBQUMsT0FBTztZQUFFLE9BQU8sS0FBSyxDQUFDO1FBRTFCLE1BQU0sRUFDRixFQUFFLEVBQ0YsS0FBSyxFQUNMLElBQUksRUFDSixXQUFXLEdBQUMsS0FBSyxFQUNqQixNQUFNLEdBQUMsSUFBSSxHQUNkLEdBQUcsT0FBTyxDQUFDO1FBRVosSUFBRyxDQUFDLEVBQUU7WUFBRSxPQUFPLEtBQUssQ0FBQztRQUNyQixJQUFHLENBQUMsS0FBSztZQUFFLE9BQU8sS0FBSyxDQUFDO1FBQ3hCLElBQUcsQ0FBQyxJQUFJO1lBQUUsT0FBTyxLQUFLLENBQUM7UUFFdkIsSUFBRyxXQUFXLEVBQUMsQ0FBQztZQUNaLE1BQU0sTUFBTSxHQUFHLE1BQU0sQ0FBQyxTQUFTLENBQUMsRUFBRSxDQUFDLENBQUM7WUFDcEMsSUFBRyxNQUFNLENBQUMsTUFBTSxHQUFHLENBQUM7Z0JBQUUsT0FBTztRQUNqQyxDQUFDO1FBRUQsSUFBSSxNQUFNLEdBQUcsTUFBTSxFQUFFLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsRUFBRSxJQUFJLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUMzRCxJQUFHLE1BQU0sQ0FBQyxNQUFNLElBQUksQ0FBQztZQUFFLE9BQU87UUFFOUIsTUFBTSxZQUFZLEdBQUcsRUFBRSxDQUFDO1FBQ3hCLEtBQUksTUFBTSxJQUFJLElBQUksTUFBTSxFQUFDLENBQUM7WUFDdEIsTUFBTSxFQUFFLEdBQUcsS0FBSyxJQUFJLEVBQUUsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLFdBQVcsRUFBRSxJQUFJLENBQUMsQ0FBQztZQUVsRSxNQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDO1lBQ3JCLElBQUcsR0FBRyxHQUFHLElBQUksR0FBRyxJQUFJLENBQUMsR0FBRyxFQUFFLEVBQUMsQ0FBQztnQkFDeEIsTUFBTSxFQUFFLEVBQUUsQ0FBQztnQkFDWCxTQUFTO1lBQ2IsQ0FBQztZQUVELE1BQU0sV0FBVyxHQUFHLE1BQU0sRUFBRSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxFQUFFLEVBQUUsS0FBSyxFQUFFLElBQUksQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1lBQ3ZFLElBQUcsQ0FBQyxXQUFXLEVBQUMsQ0FBQztnQkFDYixNQUFNLEVBQUUsRUFBRSxDQUFDO2dCQUNYLFNBQVM7WUFDYixDQUFDO1lBRUQsWUFBWSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDakMsQ0FBQztRQUVELElBQUcsQ0FBQztZQUNBLFlBQVksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLEVBQUU7Z0JBQ3pCLElBQUcsQ0FBQztvQkFDQSxNQUFNLE9BQU8sR0FBRzt3QkFDWixZQUFZLEVBQUUsRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFO3dCQUM3QixLQUFLO3dCQUNMLElBQUksRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsTUFBTSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLEVBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUztxQkFDL0QsQ0FBQTtvQkFDRCxNQUFNLENBQUMsYUFBYSxDQUFDLFNBQVMsRUFBRSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztnQkFDbkQsQ0FBQztnQkFBQSxPQUFNLENBQUMsRUFBQyxDQUFDO29CQUNOLElBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxRQUFRLElBQUksYUFBYTt3QkFBRSxFQUFFLENBQUMsa0JBQWtCLEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDO2dCQUNoRixDQUFDO1lBQ0wsQ0FBQyxDQUFDLENBQUE7UUFDTixDQUFDO1FBQUEsTUFBSyxDQUFDLENBQUEsQ0FBQztJQUNaLENBQUM7Q0FDSixDQUFBIn0=