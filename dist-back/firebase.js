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
export { admin as firebaseAdmin };
export default async function firebaseSend(options) {
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
                admin.messaging().send(message);
            }
            catch (e) {
                if (process.env.NODE_ENV == "development")
                    lo("Firebase error: ", e.message);
            }
        });
    }
    catch { }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmlyZWJhc2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9iYWNrL2ZpcmViYXNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sS0FBSyxNQUFNLGdCQUFnQixDQUFDO0FBQ25DLE9BQU8sRUFBRSxNQUFNLElBQUksQ0FBQztBQUNwQixPQUFPLEVBQUUsTUFBTSxZQUFZLENBQUM7QUFHNUIsSUFBSSxDQUFDO0lBQ0QsTUFBTSxjQUFjLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsWUFBWSxDQUFDLHNCQUFzQixFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUM7SUFDbkYsS0FBSyxDQUFDLGFBQWEsQ0FBQztRQUNoQixVQUFVLEVBQUUsS0FBSyxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDO0tBQ3BELENBQUMsQ0FBQztBQUNQLENBQUM7QUFBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO0FBRVgsT0FBTyxFQUFFLEtBQUssSUFBSSxhQUFhLEVBQUUsQ0FBQztBQUVsQyxNQUFNLENBQUMsT0FBTyxDQUFDLEtBQUssVUFBVSxZQUFZLENBQUMsT0FBMEI7SUFDakUsSUFBSSxDQUFDLE9BQU87UUFBRSxPQUFPLEtBQUssQ0FBQztJQUUzQixNQUFNLEVBQ0YsRUFBRSxFQUNGLEtBQUssRUFDTCxJQUFJLEVBQ0osV0FBVyxHQUFHLEtBQUssRUFDbkIsTUFBTSxHQUFHLElBQUksR0FDaEIsR0FBRyxPQUFPLENBQUM7SUFFWixJQUFJLENBQUMsRUFBRTtRQUFFLE9BQU8sS0FBSyxDQUFDO0lBQ3RCLElBQUksQ0FBQyxLQUFLO1FBQUUsT0FBTyxLQUFLLENBQUM7SUFDekIsSUFBSSxDQUFDLElBQUk7UUFBRSxPQUFPLEtBQUssQ0FBQztJQUV4QixJQUFJLFdBQVcsRUFBRSxDQUFDO1FBQ2QsTUFBTSxNQUFNLEdBQUcsTUFBTSxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUNwQyxJQUFJLE1BQU0sQ0FBQyxNQUFNLEdBQUcsQ0FBQztZQUFFLE9BQU87SUFDbEMsQ0FBQztJQUVELElBQUksTUFBTSxHQUFHLE1BQU0sRUFBRSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLEVBQUUsSUFBSSxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUM7SUFDM0QsSUFBSSxNQUFNLENBQUMsTUFBTSxJQUFJLENBQUM7UUFBRSxPQUFPO0lBRS9CLE1BQU0sWUFBWSxHQUFHLEVBQUUsQ0FBQztJQUN4QixLQUFLLE1BQU0sSUFBSSxJQUFJLE1BQU0sRUFBRSxDQUFDO1FBQ3hCLE1BQU0sRUFBRSxHQUFHLEtBQUssSUFBSSxFQUFFLENBQUMsTUFBTSxFQUFFLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxXQUFXLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFFbEUsTUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQztRQUNyQixJQUFJLEdBQUcsR0FBRyxJQUFJLEdBQUcsSUFBSSxDQUFDLEdBQUcsRUFBRSxFQUFFLENBQUM7WUFDMUIsTUFBTSxFQUFFLEVBQUUsQ0FBQztZQUNYLFNBQVM7UUFDYixDQUFDO1FBRUQsTUFBTSxXQUFXLEdBQUcsTUFBTSxFQUFFLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLEVBQUUsRUFBRSxLQUFLLEVBQUUsSUFBSSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDdkUsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDO1lBQ2YsTUFBTSxFQUFFLEVBQUUsQ0FBQztZQUNYLFNBQVM7UUFDYixDQUFDO1FBRUQsWUFBWSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDakMsQ0FBQztJQUVELElBQUksQ0FBQztRQUNELFlBQVksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLEVBQUU7WUFDekIsSUFBSSxDQUFDO2dCQUNELE1BQU0sT0FBTyxHQUFHO29CQUNaLFlBQVksRUFBRSxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUU7b0JBQzdCLEtBQUs7b0JBQ0wsSUFBSSxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxNQUFNLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxTQUFTO2lCQUNoRSxDQUFBO2dCQUNELEtBQUssQ0FBQyxTQUFTLEVBQUUsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDcEMsQ0FBQztZQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUM7Z0JBQ1QsSUFBSSxPQUFPLENBQUMsR0FBRyxDQUFDLFFBQVEsSUFBSSxhQUFhO29CQUFFLEVBQUUsQ0FBQyxrQkFBa0IsRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDakYsQ0FBQztRQUNMLENBQUMsQ0FBQyxDQUFBO0lBQ04sQ0FBQztJQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7QUFDZixDQUFDIn0=