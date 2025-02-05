import http from "http";
import url from "url";
import { WebSocketServer } from "ws";
import valid from "../utils/valid";
import { sendToFront } from "../utils/utils";
import vars from "../vars";
import { ApiServerParams } from "../types/apiServer";

const definedFns = {
    status: (params: ApiServerParams, ws: boolean) => {
        if (!params) return;
        const {
            state,
            name,

            details,
            logoName,
            logoText,
            startTime,
            endTime,
            party,
        } = params;

        if (!state) return;
        if (!name) return;
        if (!valid.str(state, 1)) return;
        if (!valid.str(name, 1)) return;

        if (details && !valid.str(details, 1)) return;
        if (logoName && !valid.str(logoName, 1)) return;
        if (logoText && !valid.str(logoText, 1)) return;
        if (startTime && !valid.num(startTime)) return;
        if (endTime && !valid.num(endTime)) return;
        if (!ws && !endTime) params.endTime = Date.now() + 2 * 60 * 1000; // 2 minutes
        if (party) {
            if (!valid.obj(party)) return;
            const { id, state, max } = party;
            if (!valid.str(id, 1)) return;
            if (!valid.num(state)) return;
            if (!valid.num(max)) return;
        }
        sendToFront({
            type: "status",
            data: params
        });
        return true;
    }
};

function findFreePort(startPort: number, endPort: number): Promise<number> {
    function isPortFree(port: number) {
        return new Promise(resolve => {
            const server = http.createServer()
                .listen(port, () => {
                    server.close();
                    resolve(true);
                })
                .on("error", () => {
                    resolve(false);
                })
        });
    }

    return new Promise(async (resolve, reject) => {
        for (let port = startPort; port <= endPort; port++) {
            if (vars.confArg.dev) console.log("Trying port", port);
            const free = await isPortFree(port);
            if (!free) continue;

            resolve(port);
            return;
        }
        reject("Could not find free port");
    });
}

function createServer(port: number) {
    const server = http.createServer((req, res) => {
        res.setHeader("Content-Type", "application/json");
        function send(msg: string, code: number = 200, data = {}) {
            res.statusCode = code;
            res.end(JSON.stringify({ res: msg, ...data }));
        }
        if (req.method !== "GET") return send("Bad request. Api only supports GET requests.", 400);

        switch (req.url.split("?")[0]) {
            case "/hello":
                return send("hello");
            case "/status":
                try {
                    const paramsRaw = url.parse(req.url, true).query as any;
                    const params = JSON.parse(paramsRaw.payload) as ApiServerParams;
                    const ok = definedFns.status(params, false);
                    return ok ? send("OK", 200) : send("Bad request", 400);
                } catch (e) {
                    return send("Bad request", 400);
                }
        }

        send("Not found", 404);
    });
    const wss = new WebSocketServer({ server });
    wss.on("connection", (ws) => {
        ws.on("message", (msg: string) => {
            try {
                const { type, data } = JSON.parse(msg);

                if (type == "hello") return ws.send(JSON.stringify({ res: "hello" }));

                const types = ["status"];
                if (!types.includes(type)) return;
                definedFns[type](data, true);
            } catch (e) {
                console.error(e);
            }
        });
        ws.on("close", () => {
            sendToFront({
                type: "status",
                data: "clear"
            })
        })
    });
    server.listen(port);
    vars.wss = wss;
}

export async function apiServer_start() {
    try {
        const basePort = vars.confArg["rpc-port"];
        const port = await findFreePort(basePort, basePort + 20).catch(() => 0); // get port from pool or random
        console.log(`API server started on $port[${port}]`);
        createServer(port);
    } catch (e) {
        console.error(e);
    }
}

export function apiServer_define(name: string, fn: Function) {
    definedFns[name] = fn;
}