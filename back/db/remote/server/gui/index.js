const databaseServerList = document.querySelector("#database-server-list");
const data_output = document.querySelector("#data-output");
const navPos = document.querySelector("nav");
const queryDivDb = document.querySelector("#query-div-db");
const queryDivGraph = document.querySelector("#query-div-graph");
let db_data = [];

const vars = {
    selectedServer: null,
    selectedDb: null,
    selectedTable: null,
}

async function addDb(){
    const url = document.querySelector("#addDb-url").value;
    const name = document.querySelector("#addDb-name").value;
    const login = document.querySelector("#addDb-login").value;
    const pass = document.querySelector("#addDb-pass").value;

    const dbId = await loginToDb(url, name, login, pass);
    if(!dbId) return;
}

function renderServerList(){
    const serversList = [];
    Object.keys(serversMeta).forEach(id => {
        serversList.push({
            id,
            name: serversMeta[id].name,
            saved: serversMeta[id].saved || false
        });
    })
    databaseServerList.innerHTML = databasesListTemplate({ serversList });

    Object.keys(serversMeta).forEach(id => {
        rednerServer(id);
    })
}

async function rednerServer(id){
    const server = serversMeta[id];
    if(!server) return;
    const nav = document.querySelector("#database-nav-"+id);
    nav.innerHTML = "";

    const dbsObj = await loadDbList(id);
    const dbsArray = [];
    Object.keys(dbsObj).forEach(db => {
        dbsArray.push({
            serverId: id,
            name: db
        });
    })
    nav.innerHTML = databaseNavTemplate({ dbs: dbsArray });
}

async function renderTables(serverId, dbName){
    const nav = document.querySelector("#database-nav-"+serverId+"-"+dbName);
    nav.innerHTML = "";
    vars.selectedServer = serverId;
    vars.selectedDb = dbName;
    vars.selectedTable = null;
    updateQueryStyle();
    const tables = await getDbTables(serverId, dbName);
    nav.innerHTML = databasesTablesTemplate({ tables });
}

function selectTable(table){
    vars.selectedTable = table;
    updateQueryStyle();
}

function updateQueryStyle(){
    const dbType = getSelectedDatabase().type;
    switch(dbType){
        case "database":
            queryDivDb.style.display = "block";
            queryDivGraph.style.display = "none";
        break;
        case "graph":
            queryDivDb.style.display = "none";
            queryDivGraph.style.display = "block";
        break;
    }
}

new AutoUpdater(vars, "selectedServer", "#selected-server", data => data ? serversMeta[data]?.name + " >" : "-");
new AutoUpdater(vars, "selectedDb", "#selected-database", data => data ? data + " >" : "-");
new AutoUpdater(vars, "selectedTable", "#selected-table", data => data ? data : "-");

document.querySelector("#nav__toggle").addEventListener("click", () => {
    navPos.style.left = navPos.style.left == "0px" ? "-" +navPos.clientWidth + "px" : "0px";
});
getServersFromStorage().then(renderServerList);