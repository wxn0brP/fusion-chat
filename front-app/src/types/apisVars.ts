import { Core_socket__user_status_type } from "./core/socket";
import Id from "./Id";
import { Utils_updater } from "./utils";
import { Vars_user__activity } from "./var";

interface ApisVars {
    temp: {
        user: {
            main: {
                [id: Id]: string;
            };
            [chat: Id]: {
                [id: Id]: string | 0; // 0 if user haven't realm nick
            }
        };
        realm: {
            [id: Id]: string;
        };
    };
    user_state: {
        [id: Id]: {
            status: Utils_updater<Core_socket__user_status_type>;
            statusText: Utils_updater<string>;
            activity: Utils_updater<Vars_user__activity | null>;
        }
    };
    lastMess: {
        [id: Id]: {
            main?: {
                read: Id;
                mess: Id;
            }
            [id: Id]: {
                read: Id;
                mess: Id;
            }
        }
    };
}

export default ApisVars;