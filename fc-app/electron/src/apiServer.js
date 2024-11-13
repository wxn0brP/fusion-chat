const http = require("http");
const url = require("url");
const ws = require("ws");
const valid = require("./valid");
const { sendToFront } = require("./utils");

const definedFns = {
    status: (params, ws) => {
        if(!params) return;
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

        if(!state) return;
        if(!name) return;
        if(!valid.str(state, 1)) return;
        if(!valid.str(name, 1)) return;

        if(details && !valid.str(details, 1)) return;
        if(logoName && !valid.str(logoName, 1)) return;
        if(logoText && !valid.str(logoText, 1)) return;
        if(startTime && !valid.num(startTime)) return;
        if(endTime && !valid.num(endTime)) return;
        if(!ws && !endTime) params.endTime = Date.now() + 2 * 60 * 1000; // 2 minutes
        if(party){
            if(!valid.obj(party)) return;
            const { id, state, max } = party;
            if(!valid.str(id, 1)) return;
            if(!valid.num(state)) return;
            if(!valid.num(max)) return;
        }
        sendToFront({
            type: "status",
            data: params
        });
    }
};

function findFreePort(startPort, endPort){
    function isPortFree(port){
        return new Promise(resolve => {
            const server = http.createServer()
            .listen(port, () => {
                server.close();
                resolve(true);
            })
            .on('error', () => {
                resolve(false);
            })
        });
    }
    
    return new Promise(async (resolve, reject) => {
        for(let port=startPort; port<=endPort; port++){
            if(confArg.dev) console.log("Trying port", port);
            const free = await isPortFree(port);
            if(!free) continue;

            resolve(port);
            return;
        }
        reject("Could not find free port");
    });
}

function createServer(port){
    const server = http.createServer((req, res) => {
        res.setHeader('Content-Type', 'application/json');
        function send(msg, code=200, data={}){
            res.statusCode = code;
            res.end(JSON.stringify({ res: msg, ...data }));
        }
        if(req.method !== "GET") return send("Bad request. Api only supports GET requests.", 400);
        
        switch(req.url.split("?")[0]){
            case "/hello":
                return send("hello");
            case "/status":
                const params = url.parse(req.url, true).query;
                definedFns.status(params, false);
                return send("OK", 200);
        }

        send("Not found", 404);
    });
    const wss = new ws.Server({ server });
    wss.on("connection", (ws) => {
        ws.on("message", (msg) => {
            try{
                const { type, data } = JSON.parse(msg);

                if(type == "hello") return ws.send(JSON.stringify({ res: "hello" }));

                const types = ["status"];
                if(!types.includes(type)) return;
                definedFns[type](data, true);
            }catch(e){
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
    module.exports.server = server;
}

module.exports = {
    async start(){
        try{
            const basePort = confArg["rpc-port"];
            const port = await findFreePort(basePort, basePort+20).catch(() => 0); // get port from pool or random
            console.log(`API server started on $port[${port}]`);
            createServer(port);
        }catch(e){
            console.error(e);
        }
    },

    define(name, fn){
        definedFns[name] = fn;
    }
}

