import { Id } from "../id";

interface Session {
    [key: string]: any;
}

declare global {
    namespace Express {
        interface Request {
            session: Session;
            user: Id;
        }
    }
}