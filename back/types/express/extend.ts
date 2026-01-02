import FalconFrame from "@wxn0brp/falcon-frame";
import { Id } from "../id";

interface Session {
	[key: string]: any;
}

declare module "@wxn0brp/falcon-frame" {
	interface FFRequest {
		session: Session;
		user: Id;
	}
}