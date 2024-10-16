let serversData = {};
let serversMeta = {};
const addServerDiv = document.querySelector("#addServer");
const addServer_url = document.querySelector("#addServer-url");
const addServer_name = document.querySelector("#addServer-name");
const addServer_login = document.querySelector("#addServer-login");
const addServer_pass = document.querySelector("#addServer-pass");
let loginPromise = null;

async function loadDbList(serverId){
    const server = serversMeta[serverId];
    if(!server) return;
    const res = await fetch(server.url + "getDbList", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": server.token
        },
    }).then(res => res.json());

    if(res.err){
        alert(res.msg);
        return;
    }
    serversData[serverId] = {};
    const dbObj = serversData[serverId];
    res.result.forEach(db => {
        dbObj[db.name] = {
            collections: [],
            type: db.type
        };
    });
    return dbObj;
}

async function loginToDb(serverUrl, serverName, login, password){
    if(!serverUrl.endsWith("/")) serverUrl += "/";
    const res = await fetch(serverUrl + "login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ login, password })
    }).then(res => res.json());
    if(res.err){
        alert(res.msg);
        return false;
    }

    const id = Object.keys(serversMeta).length + 1;
    serversMeta[id] = {
        url: serverUrl,
        token: res.token,
        name: serverName
    }
    return id;
}

async function getDbTables(serverId, dbName){
    const server = serversMeta[serverId];
    if(!server) return;

    const res = await fetch(server.url + "db/" + getSelectedDatabase().type + "/getCollections", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": server.token
        },
        body: JSON.stringify({ db: dbName })
    }).then(res => res.json());
    if(res.err){
        alert(res.msg);
        return;
    }

    serversData[serverId][dbName].collections = res.result;
    return res.result;
}

async function addServer(cancel=false){
    if(!cancel){
        const url = addServer_url.value;
        const name = addServer_name.value;
        const login = addServer_login.value;
        const pass = addServer_pass.value;

        if(!url || !name || !login || !pass){
            alert("All fields are required");
            return;
        }

        const serverId = await loginToDb(url, name, login, pass);
        if(!serverId) return;
        if(loginPromise){
            loginPromise();
            loginPromise = null;
            serversMeta[serverId].saved = true;
        }else{
            renderServerList();
        }
    }else{
        if(loginPromise){
            loginPromise();
            loginPromise = null;
        }
    }
    
    addServer_url.value = "";
    addServer_name.value = "";
    addServer_login.value = "";
    addServer_pass.value = "";

    addServerDiv.fadeOut();
}

function addServerStorage(id){
    let servers = JSON.parse(localStorage.getItem("servers") || "[]");
    const server = serversMeta[id];
    servers.push({
        name: server.name,
        url: server.url,
    });
    localStorage.setItem("servers", JSON.stringify(servers));
}

function removeServerStorage(serverId){
    let servers = JSON.parse(localStorage.getItem("servers"));
    if(!servers) servers = [];
    const server = serversMeta[serverId];
    server.saved = false;

    servers = servers.filter(s => s.url !== server.url && s.name !== server.name);
    localStorage.setItem("servers", JSON.stringify(servers));
}

async function getServersFromStorage(){
    let servers = JSON.parse(localStorage.getItem("servers"));
    if(!servers) return;
    
    for(let server of servers){
        await new Promise(resolve => {
            loginPromise = resolve;
            addServer_url.value = server.url;
            addServer_name.value = server.name;
            addServer_login.value = "";
            addServer_pass.value = "";
            addServerDiv.fadeIn();
        });
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
    renderServerList();
}