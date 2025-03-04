import { Router } from "express";
import valid from "../../../logic/validData.js";
import db from "../../../dataBase.js";
import InternalCode from "../../../codes/index.js";
const router = Router();
router.get("/id/u", async (req, res) => {
    const { id, chat } = req.query;
    if (!valid.id(id))
        return res.json({ err: true, c: InternalCode.UserError.Express.MissingParameters, msg: "id" });
    if (chat && !valid.id(chat))
        return res.json({ err: true, c: InternalCode.UserError.Express.MissingParameters, msg: "chat" });
    if (chat) {
        const userData = await db.realmData.findOne(chat, { uid: id });
        if (userData)
            return res.json({ err: false, name: userData.name, c: 1 });
    }
    const user = await db.data.findOne("user", { _id: id });
    if (!user) {
        const rm = await db.data.findOne("rm", { _id: id });
        if (rm)
            return res.json({ err: false, name: "Deleted User " + id, c: -1 });
        return res.json({ err: true, c: InternalCode.UserError.Express.UserId_NotFound, msg: "user is not found" });
    }
    const nickData = await db.userData.findOne(id, { $exists: { nick: true } });
    if (nickData)
        return res.json({ err: false, name: nickData.nick, c: 0 });
    return res.json({ err: false, name: user.name, c: 0 });
});
export default router;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXNlcklkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vYmFjay9leHByZXNzL2FwaS9pZC91c2VySWQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLFNBQVMsQ0FBQztBQUNqQyxPQUFPLEtBQUssTUFBTSxrQkFBa0IsQ0FBQztBQUNyQyxPQUFPLEVBQUUsTUFBTSxLQUFLLENBQUM7QUFFckIsT0FBTyxZQUFZLE1BQU0sUUFBUSxDQUFDO0FBQ2xDLE1BQU0sTUFBTSxHQUFHLE1BQU0sRUFBRSxDQUFDO0FBRXhCLE1BQU0sQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLEtBQUssRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEVBQUU7SUFDbkMsTUFBTSxFQUFFLEVBQUUsRUFBRSxJQUFJLEVBQUUsR0FBRyxHQUFHLENBQUMsS0FBOEIsQ0FBQztJQUN4RCxJQUFHLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7UUFBRSxPQUFPLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFFLENBQUMsRUFBRSxZQUFZLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxpQkFBaUIsRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQztJQUNqSCxJQUFHLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDO1FBQUUsT0FBTyxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBRSxDQUFDLEVBQUUsWUFBWSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsaUJBQWlCLEVBQUUsR0FBRyxFQUFFLE1BQU0sRUFBRSxDQUFDLENBQUM7SUFFN0gsSUFBRyxJQUFJLEVBQUMsQ0FBQztRQUNMLE1BQU0sUUFBUSxHQUFHLE1BQU0sRUFBRSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLEVBQUUsR0FBRyxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDL0QsSUFBRyxRQUFRO1lBQUUsT0FBTyxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsUUFBUSxDQUFDLElBQUksRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUM1RSxDQUFDO0lBRUQsTUFBTSxJQUFJLEdBQUcsTUFBTSxFQUFFLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUUsRUFBRSxHQUFHLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQztJQUN4RCxJQUFHLENBQUMsSUFBSSxFQUFDLENBQUM7UUFDTixNQUFNLEVBQUUsR0FBRyxNQUFNLEVBQUUsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxFQUFFLEdBQUcsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQ3BELElBQUcsRUFBRTtZQUNELE9BQU8sR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFLEdBQUcsRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLGVBQWUsR0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUNyRSxPQUFPLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFFLENBQUMsRUFBRSxZQUFZLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxlQUFlLEVBQUUsR0FBRyxFQUFFLG1CQUFtQixFQUFFLENBQUMsQ0FBQztJQUNoSCxDQUFDO0lBRUQsTUFBTSxRQUFRLEdBQUcsTUFBTSxFQUFFLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxFQUFFLEVBQUUsRUFBRSxPQUFPLEVBQUUsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLEVBQUMsQ0FBQyxDQUFDO0lBQzNFLElBQUcsUUFBUTtRQUFFLE9BQU8sR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFLEdBQUcsRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLFFBQVEsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7SUFFeEUsT0FBTyxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUMzRCxDQUFDLENBQUMsQ0FBQztBQUVILGVBQWUsTUFBTSxDQUFDIn0=