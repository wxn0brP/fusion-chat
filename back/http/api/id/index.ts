import { Router } from "@wxn0brp/falcon-frame";
import { botIdRoute } from "./botId";
import { chatIdRoute } from "./chatId";
import { eventIdRoute } from "./eventId";
import { userIdRoute } from "./userId";
import { webhookIdRoute } from "./webhookId";

export const idRouter = new Router();

idRouter.get("/bot", botIdRoute);
idRouter.get("/chat", chatIdRoute);
idRouter.get("/event", eventIdRoute);
idRouter.get("/u", userIdRoute);
idRouter.get("/wh", webhookIdRoute);