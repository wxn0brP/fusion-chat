import { Router } from "@wxn0brp/falcon-frame";
import { deleteAccountRouter } from "./account/deleteAccount";
import { loginRouter } from "./account/login";
import { registerRouter } from "./account/register";
import { announcementRouter } from "./features/announcement";
import inviteBotRouter from "./features/botInvite";
import { fireTokenRouter } from "./features/fireToken";
import { realmJoinRouter } from "./features/realmJoin";
import { webhookRouter } from "./features/webhook";
import { botProfileRouter } from "./file/botProfile";
import { emojiRouter } from "./file/emoji";
import { realmProfileRouter } from "./file/realmProfile";
import { fileUploadRouter } from "./file/uploadFile";
import { userProfileRouter } from "./file/userProfile";
import { idRouter } from "./id";

export const apiRouter = new Router();

apiRouter.use("/id", idRouter);

apiRouter.use("/account/delete", deleteAccountRouter);
apiRouter.use("/", loginRouter);
apiRouter.use("/", registerRouter);

apiRouter.use("/bot/profile", botProfileRouter);
apiRouter.use("/", emojiRouter);
apiRouter.use("/realm", realmProfileRouter);
apiRouter.use("/", fileUploadRouter);
apiRouter.use("/profile", userProfileRouter);

apiRouter.use("/", announcementRouter);
apiRouter.use("/iv/bot", inviteBotRouter);
apiRouter.use("/", fireTokenRouter);
apiRouter.use("/realm/join", realmJoinRouter);
apiRouter.use("/", webhookRouter);