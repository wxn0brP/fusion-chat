// back/config-base/database.ts
var database_default = {
  remoteDefault: {
    url: "",
    auth: ""
  },
  data: {
    type: "local",
    path: "data/data"
  },
  dataGraph: {
    type: "local",
    path: "data/dataGraph"
  },
  system: {
    type: "local",
    path: "data/system"
  },
  logs: {
    type: "local",
    path: "data/logs"
  },
  mess: {
    type: "local",
    path: "data/mess"
  },
  userData: {
    type: "local",
    path: "data/userData"
  },
  botData: {
    type: "local",
    path: "data/botData"
  },
  realmConf: {
    type: "local",
    path: "data/realmConf"
  },
  realmRoles: {
    type: "local",
    path: "data/realmRoles"
  },
  realmUser: {
    type: "local",
    path: "data/realmUser"
  },
  realmData: {
    type: "local",
    path: "data/realmData"
  },
  realmDataGraph: {
    type: "local",
    path: "data/realmDataGraph"
  }
};
export {
  database_default as default
};
