var __defProp = Object.defineProperty;
var __returnValue = (v) => v;
function __exportSetter(name, newValue) {
  this[name] = __returnValue.bind(null, newValue);
}
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, {
      get: all[name],
      enumerable: true,
      configurable: true,
      set: __exportSetter.bind(all, name)
    });
};
var __esm = (fn, res) => () => (fn && (res = fn(fn = 0)), res);
var __promiseAll = (args) => Promise.all(args);

// back/setUp.ts
var exports_setUp = {};
import fs from "fs";
function dir(path) {
  if (!fs.existsSync(path))
    fs.mkdirSync(path);
}
function file(path, value = "", prefix = "config/") {
  if (!fs.existsSync(prefix + path))
    fs.writeFileSync(prefix + path, value);
}
function preFile(path, pre = path, prefix = "config/") {
  if (!fs.existsSync(prefix + path + ".js"))
    fs.copyFileSync("dist-back/config-base/" + pre + ".js", prefix + path + ".js");
}
var init_setUp = __esm(() => {
  dir("data");
  dir("config");
  dir("userFiles");
  dir("userFiles/users");
  dir("userFiles/profiles");
  dir("userFiles/realms");
  file("bannedIP.json", "[]");
  file("mailConfig.json", "{}");
  preFile("file");
  preFile("database");
  preFile("logs");
  preFile("cache");
});

// back/logic/token/calculateJwtToken.ts
import os from "os";
import crypto from "crypto";
function generateJwtSecret() {
  const macAddresses = os.networkInterfaces();
  const hostname = os.hostname();
  const cpuModels = os.cpus()[0].model;
  const platform = os.platform();
  const arch = os.arch();
  const macAddress = Object.values(macAddresses).flat().filter((iface) => iface.mac !== "00:00:00:00:00:00" && !iface.internal).map((iface) => iface.mac).join("-");
  const secretData = `${hostname}-${cpuModels}-${platform}-${arch}-${macAddress}`;
  return crypto.createHash("sha256").update(secretData).digest("hex");
}
var calculateJwtToken_default;
var init_calculateJwtToken = __esm(() => {
  calculateJwtToken_default = generateJwtSecret;
});

// back/env.ts
var exports_env = {};
var env;
var init_env = __esm(() => {
  init_calculateJwtToken();
  env = process.env;
  if (!env.PORT)
    env.PORT = "1478";
  if (!env.NODE_ENV)
    env.NODE_ENV = "development";
  if (!env.IS_TECHNICAL_BREAK)
    env.IS_TECHNICAL_BREAK = "false";
  if (!env.JWT)
    env.JWT = calculateJwtToken_default();
});

// back/loadConfig.ts
async function loadConfig(name, def = true) {
  const mod = await import("../config/" + name + ".js");
  if (def)
    return mod.default;
  return mod;
}

// back/global.ts
var exports_global = {};
var init_global = __esm(async () => {
  global.lo = function(...data) {
    let line = new Error().stack.split(`
`)[2].trim();
    let path = line.slice(line.indexOf("(")).replace(global.dir, "").replace("(", "").replace(")", "");
    if (path.length < 2)
      path = line.replace(global.dir, "").replace("at ", "");
    console.log("\x1B[36m" + path + ":\x1B[0m", ...data);
  };
  global.delay = (ms) => new Promise((res) => setTimeout(res, ms));
  global.fileConfig = await loadConfig("file");
  global.logsConfig = await loadConfig("logs");
});

// back/dataBase.ts
var exports_dataBase = {};
__export(exports_dataBase, {
  default: () => dataBase_default
});
import { forgeValthera, ValtheraRemote } from "@wxn0brp/db";
import { Valthera } from "@wxn0brp/db/valthera";
function getRemoteConfig(name, path) {
  const cnf = {
    name,
    path,
    url: null,
    auth: null
  };
  const custom = config[name];
  if (custom.url && custom.auth) {
    cnf.url = custom.url;
    cnf.auth = custom.auth;
  } else {
    cnf.url = config.remoteDefault.url;
    cnf.auth = config.remoteDefault.auth;
  }
  return cnf;
}
async function initValthera(name) {
  const cfg = config[name];
  if (cfg.type === "local") {
    return new Valthera(cfg.path);
  } else if (cfg.type === "remote") {
    const remoteCfg = getRemoteConfig(name, cfg.path);
    return new ValtheraRemote(remoteCfg);
  } else {
    throw new Error("Unknown database type " + cfg.name);
  }
}
var config, db, databases, dataBase_default;
var init_dataBase = __esm(async () => {
  config = await loadConfig("database");
  db = {};
  databases = [
    "data",
    "dataGraph",
    "system",
    "logs",
    "mess",
    "userData",
    "botData",
    "realmConf",
    "realmRoles",
    "realmUser",
    "realmData",
    "realmDataGraph"
  ];
  for (const dbName of databases) {
    db[dbName] = forgeValthera(await initValthera(dbName));
  }
  dataBase_default = db;
});

// back/socket/server.ts
import { GlovesLinkServer } from "@wxn0brp/gloves-link-server";
var io;
var init_server = __esm(() => {
  io = new GlovesLinkServer({
    logs: true
  });
});

// back/firebase.ts
var exports_firebase = {};
__export(exports_firebase, {
  firebaseAdmin: () => admin,
  default: () => firebaseSend
});
import admin from "firebase-admin";
import fs2 from "fs";
async function firebaseSend(options) {
  if (!options)
    return false;
  const { to, title, body, checkSocket = false, action = null } = options;
  if (!to)
    return false;
  if (!title)
    return false;
  if (!body)
    return false;
  if (checkSocket) {
    if (io.room("user-" + to).size > 0)
      return;
  }
  let tokens = await dataBase_default.data.c("fireToken").find({ user: to });
  if (tokens.length == 0)
    return;
  const workedTokens = [];
  for (const data of tokens) {
    const rm = async () => await dataBase_default.data.c("fireToken").removeOne(data);
    const exp = data.exp;
    if (exp * 1000 < Date.now()) {
      await rm();
      continue;
    }
    const tokenLogged = await dataBase_default.data.c("token").findOne({ token: data.fc });
    if (!tokenLogged) {
      await rm();
      continue;
    }
    workedTokens.push(data.fire);
  }
  try {
    workedTokens.forEach((token) => {
      try {
        const message = {
          notification: { title, body },
          token,
          data: action ? { action: JSON.stringify(action) } : undefined
        };
        admin.messaging().send(message);
      } catch (e) {
        if (true)
          lo("Firebase error: ", e.message);
      }
    });
  } catch {}
}
var init_firebase = __esm(async () => {
  init_server();
  await init_dataBase();
  try {
    const serviceAccount = JSON.parse(fs2.readFileSync("config/firebase.json", "utf8"));
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
  } catch {}
});

// back/logs.ts
var exports_logs = {};
var init_logs = __esm(async () => {
  await init_dataBase();
  process.on("uncaughtException", (e) => {
    try {
      console.error("Uncaught Exception: ", e);
      dataBase_default.logs.c("uncaughtException").add({
        error: e.message,
        stackTrace: e.stack
      });
    } catch (e2) {
      console.error("Critical error: ", e2);
    }
  });
  process.on("unhandledRejection", (reason, promise) => {
    try {
      console.error("Unhandled Rejection: ", reason);
      dataBase_default.logs.c("unhandledRejection").add({
        reason,
        promise
      });
    } catch (e) {
      console.error("Critical error: ", e);
    }
  });
});

// back/logic/deleteAccount.ts
var deleteAccount_default = async (id) => {
  await dataBase_default.data.c("user").removeOne({ _id: id });
  await dataBase_default.data.c("rm").add({ _id: id });
  await dataBase_default.data.c("fireToken").removeOne({ user: id });
  const realms = await dataBase_default.userData.c(id).find({
    $exists: { realm: true }
  });
  for (const realm of realms) {
    await dataBase_default.realmUser.c(realm.realm).removeOne({ uid: id });
  }
  const bots = await dataBase_default.userData.c(id).find({ $exists: { botID: true } });
  for (const bot of bots) {
    const botRealms = await dataBase_default.botData.c(bot.botID).find({
      $exists: { realm: true }
    });
    for (const realm of botRealms) {
      await dataBase_default.realmUser.c(realm.realm).removeOne({ bot: bot.botID });
    }
    await dataBase_default.botData.removeCollection(bot.botID);
    await dataBase_default.data.c("rm").add({ _id: bot.botID });
  }
  await dataBase_default.userData.removeCollection(id);
};
var init_deleteAccount = __esm(async () => {
  await init_dataBase();
});

// back/logic/mail/contents.ts
var contents, contents_default;
var init_contents = __esm(() => {
  contents = {
    register(code) {
      return {
        subject: "Fusion Chat | Register",
        html: `
                <h1>Register account</h1>
                <h2>Code: ${code}</h2>
            `
      };
    },
    resetPassword(code) {
      return {
        subject: "Fusion Chat | Reset Password",
        html: `
                <h1>Reset password</h1>
                <h2>Code: ${code}</h2>
            `
      };
    },
    login(name, device) {
      return {
        subject: "Fusion Chat | Account Login Alert",
        html: `
                <h1>Login Alert</h1>
                <p>Hello ${name},</p>
                <p>We detected a login to your account from the following device: ${device}</p>
                <p>If this was you, you can ignore this message. If you didn't log in, please change your password immediately.</p>
                <p>Thank you. Fusion Chat Team.</p>
            `
      };
    },
    confirmDeleteAccount(name, link, cancelLink) {
      return {
        subject: "Fusion Chat | Confirm Delete Account",
        html: `
                <h1>Confirm Account Deletion</h1>
                <p>Hello ${name},</p>
                <p>If you wish to delete your account, please click the following <a href="${link}">link</a></p>
                <p>If you change your mind, after confirming, you have 24 hours to cancel the process using this <a href="${cancelLink}">link</a>.</p>
                <p>Once your account is deleted, all your data will be permanently removed.</p>
                <p>Thank you, Fusion Chat Team.</p>
            `
      };
    },
    deletedAccount(name) {
      return {
        subject: "Fusion Chat | Account Deleted",
        html: `
                <h1>Account Deleted</h1>
                <p>Hello ${name},</p>
                <p>Your account has been successfully deleted.</p>
                <p>Goodbye, thanks for this time. Fusion Chat Team.</p>
            `
      };
    }
  };
  contents_default = contents;
});

// back/logic/mail.ts
import { createTransport } from "nodemailer";
import fs3 from "fs";
function wrapHtmlContent(title, content) {
  return `
        <!DOCTYPE html>
        <html lang="en">
            <head>
                <meta charset="UTF-8">
                <title>${title}</title>
            </head>
            <body>
                ${content}
            </body>
        </html>
    `;
}
var config2, mail_default = (type, to, ...params) => {
  try {
    const smtpTransport = createTransport(config2);
    const content = contents_default[type];
    if (!content)
      return false;
    const { subject, html } = content(...params);
    const mailOptions = {
      from: config2.from,
      to,
      subject,
      html: wrapHtmlContent(subject, html).trim()
    };
    smtpTransport.sendMail(mailOptions, function(err, res) {
      smtpTransport.close();
      if (err) {
        console.error(err);
      } else {
        console.log("E-mail Sent", to);
      }
    });
  } catch (error) {
    console.error(error);
    return false;
  }
  return true;
};
var init_mail = __esm(() => {
  init_contents();
  config2 = JSON.parse(fs3.readFileSync("config/mailConfig.json", "utf8"));
});

// back/schedule/actions/deleteAccount.ts
var deleteAccount_default2 = async (data, taskId) => {
  if (!activeTasks.has(taskId))
    return;
  const uid = data.user;
  const user = await dataBase_default.data.c("user").findOne({ _id: uid });
  if (!user)
    return;
  await deleteAccount_default(uid);
  const name = user.name;
  if (global.logsConfig.mail.deletedAccount)
    mail_default("deletedAccount", user.email, name);
  await dataBase_default.system.c("tasks").removeOne({ _id: taskId });
};
var init_deleteAccount2 = __esm(async () => {
  init_mail();
  await __promiseAll([
    init_dataBase(),
    init_deleteAccount(),
    init_schedule()
  ]);
});

// back/logic/token/KeyManager.ts
import {
  generateKeyPair,
  exportSPKI,
  exportPKCS8,
  importSPKI,
  importPKCS8
} from "jose";

class KeyManager {
  db;
  constructor() {
    this.db = dataBase_default.system;
  }
  async getKeyPair(index = 0 /* GENERAL */) {
    const keyPair = await this.db.c("encryptionKeys").findOne({ index });
    if (!keyPair)
      return null;
    return {
      publicKey: await importSPKI(keyPair.pub, "RSA-OAEP-256"),
      privateKey: await importPKCS8(keyPair.prv, "RSA-OAEP-256")
    };
  }
  async addKeyPair(index) {
    const { publicKey, privateKey } = await generateKeyPair("RSA-OAEP-256");
    const publicKeyPEM = await exportSPKI(publicKey);
    const privateKeyPEM = await exportPKCS8(privateKey);
    await this.db.c("encryptionKeys").add({
      index,
      pub: publicKeyPEM,
      prv: privateKeyPEM
    }, false);
  }
  async initKeyPairs() {
    for (const index of Object.values(KeyIndex)) {
      if (typeof index !== "number")
        continue;
      const exists = await this.db.c("encryptionKeys").findOne({ index });
      if (exists)
        continue;
      await this.addKeyPair(index);
    }
  }
}
var KeyIndex, keyManager, KeyManager_default;
var init_KeyManager = __esm(async () => {
  await init_dataBase();
  ((KeyIndex2) => {
    KeyIndex2[KeyIndex2["GENERAL"] = 0] = "GENERAL";
    KeyIndex2[KeyIndex2["TEMPORARY"] = 1] = "TEMPORARY";
    KeyIndex2[KeyIndex2["USER_TOKEN"] = 2] = "USER_TOKEN";
    KeyIndex2[KeyIndex2["BOT_TOKEN"] = 3] = "BOT_TOKEN";
    KeyIndex2[KeyIndex2["WEBHOOK_TOKEN"] = 4] = "WEBHOOK_TOKEN";
  })(KeyIndex ||= {});
  keyManager = new KeyManager;
  await keyManager.initKeyPairs();
  KeyManager_default = keyManager;
});

// back/logic/token/index.ts
import { SignJWT, jwtVerify, jwtDecrypt, EncryptJWT } from "jose";
async function create(data, exp = true, encrypt = false) {
  const jwt = new SignJWT(data).setProtectedHeader({ alg: "HS256" }).setIssuedAt();
  if (exp !== false) {
    if (exp === true)
      exp = "1h";
    else if (typeof exp === "number")
      exp = exp + "s";
    jwt.setExpirationTime(exp ? exp : "1h");
  }
  const signedToken = await jwt.sign(secretKey);
  if (encrypt) {
    const keyIndex = typeof encrypt === "number" ? encrypt : 0 /* GENERAL */;
    const keyPair = await KeyManager_default.getKeyPair(keyIndex);
    if (!keyPair) {
      throw new Error(`Key with index ${keyIndex} does not exist.`);
    }
    const encryptedToken = new EncryptJWT({
      token: signedToken
    }).setProtectedHeader({ alg: "RSA-OAEP-256", enc: "A256GCM" });
    if (exp !== false)
      encryptedToken.setExpirationTime(exp ? exp : "1h");
    return await encryptedToken.encrypt(keyPair.publicKey);
  }
  return signedToken;
}
async function decode(token, keyIndex = false) {
  try {
    if (keyIndex) {
      const keyPair = await KeyManager_default.getKeyPair(keyIndex);
      if (!keyPair) {
        throw new Error(`Key with index ${keyIndex} does not exist.`);
      }
      const decrypted = await jwtDecrypt(token, keyPair.privateKey);
      const decoded = await jwtVerify(decrypted.payload.token, secretKey);
      return decoded.payload;
    } else {
      const { payload } = await jwtVerify(token, secretKey);
      return payload;
    }
  } catch (error) {
    if (true)
      lo("Token verification error:", error.message);
    return null;
  }
}
var secretKey;
var init_token = __esm(async () => {
  await init_KeyManager();
  secretKey = new TextEncoder().encode(process.env.JWT);
});

// back/socket/chat/limiter.ts
import { AnotherCache } from "@wxn0brp/ac";

class SocketEventLimiter {
  socket;
  eventCounters;
  resetTimers;
  spamThresholds;
  constructor(socket, spamThresholds = {}) {
    this.socket = socket;
    this.eventCounters = {};
    this.resetTimers = {};
    this.spamThresholds = {
      warningDelay: 100,
      warnLimit: 1,
      spamLimit: 5,
      disconnectLimit: 15,
      resetInterval: 1000,
      banDuration: 10 * 60 * 1000,
      ...spamThresholds
    };
  }
  onLimit(eventName, thresholdsParams, originalCallback) {
    const thresholds = typeof thresholdsParams === "number" ? { resetInterval: thresholdsParams } : thresholdsParams;
    const spamThresholds = {
      ...this.spamThresholds,
      ...thresholds
    };
    const resetCounter = () => {
      delete this.eventCounters[eventName];
      delete this.resetTimers[eventName];
    };
    const handler = (...data) => {
      this.eventCounters[eventName] = (this.eventCounters[eventName] || 0) + 1;
      const count = this.eventCounters[eventName];
      if (this.resetTimers[eventName])
        clearTimeout(this.resetTimers[eventName]);
      this.resetTimers[eventName] = setTimeout(resetCounter, spamThresholds.resetInterval);
      if (count === spamThresholds.warnLimit + 1) {
        setTimeout(() => {
          originalCallback(...data);
        }, spamThresholds.warningDelay);
        return;
      }
      if (count === spamThresholds.warnLimit + 2) {
        this.socket.emit("error.spam", "warn");
      }
      if (count > spamThresholds.warnLimit && count <= spamThresholds.spamLimit) {
        if (count === spamThresholds.spamLimit) {
          const time = Math.ceil(spamThresholds.resetInterval / 1000) + 1;
          this.socket.emit("error.spam", "last", time);
        }
        return;
      }
      if (count > spamThresholds.disconnectLimit) {
        const banTime = Date.now() + spamThresholds.banDuration;
        bannedUsers.set(this.socket.user._id, banTime, spamThresholds.banDuration);
        const room = io.room("user-" + this.socket.user._id);
        room.emit("error.spam", "ban", spamThresholds.banDuration);
        room.sockets.forEach((socket) => {
          socket.ws.close();
        });
        return;
      }
      originalCallback(...data);
    };
    this.socket.on(eventName, handler);
    return handler;
  }
}
var bannedUsers, limiter_default;
var init_limiter = __esm(() => {
  init_server();
  bannedUsers = new AnotherCache;
  limiter_default = SocketEventLimiter;
});

// back/socket/chat/engine.ts
class SocketEventEngine {
  socket;
  constructor(socket) {
    this.socket = socket;
  }
  add(evt, time, isReturn, cpu) {
    this.socket.onLimit(evt, time, async (...args) => {
      try {
        const data = await cpu(this.socket.user, ...args);
        if (this.socket.processSocketError(data))
          return;
        if (isReturn) {
          const cb = typeof args[args.length - 1] === "function" ? args.pop() : null;
          const res = data.res || [];
          if (cb)
            cb(...res);
          else
            this.socket.emit(evt, ...res);
        }
      } catch (e) {
        this.socket.logError(e);
      }
    });
  }
}
var engine_default;
var init_engine = __esm(() => {
  engine_default = SocketEventEngine;
});

// back/codes/index.ts
var InternalCode, codes_default;
var init_codes = __esm(() => {
  InternalCode = {
    Info: {
      General: {},
      Socket: {},
      Express: {}
    },
    Success: {
      General: {},
      Socket: {},
      Express: {}
    },
    RedirectOrWaiting: {
      General: {},
      Socket: {},
      Express: {}
    },
    UserError: {
      General: {},
      Socket: {
        NotAuthorized: "41.001",
        ChatIsNotFound: "41.002",
        ChannelIsNotFound: "41.003",
        NoPermissionToWriteMessage: "41.004",
        Dm_Blocked: "41.005",
        Dm_NotFound: "41.006",
        Dm_CreateSelf: "41.007",
        Dm_UserNotFound: "41.008",
        Dm_AlreadyExists: "41.009",
        RealmJoin_AlreadyJoined: "41.010",
        RealmJoin_UserIsBanned: "41.011",
        UserNotOnRealm: "41.012",
        Dm_BlockAlreadyBlocked: "41.013",
        FriendRequest_UserNotFound: "41.014",
        FriendRequest_Self: "41.015",
        FriendRequest_AlreadyFriend: "41.016",
        FriendRequest_AlreadySent: "41.017",
        FriendRespone_AlreadyFriend: "41.018",
        FriendRemove_FriendNotFound: "41.019",
        UserProfile_UserNotFound: "41.020",
        MessageEdit_MessageNotFound: "41.021",
        MessageEdit_NotAuthorized: "41.022",
        MessageDelete_MessageNotFound: "41.023",
        MessageDelete_NotAuthorized: "41.024",
        MessagesDelete_MessageNotFound: "41.025",
        MessagesDelete_NotAuthorized: "41.026",
        MessageFetch_ChannelNotFound: "41.027",
        MessageFetchId_ChannelNotFound: "41.028",
        MessageReact_MessageNotFound: "41.029",
        MessageReact_NotAuthorized: "41.030",
        RealmSetup_RealmNotFound: "41.031",
        RealmEdit_NotAuthorized: "41.032",
        RealmAnnouncementSubscribe_AlreadySubscribed: "41.033",
        ThreadDelete_NotFound: "41.034",
        ThreadDelete_NotAuthorized: "41.035",
        RealmEventJoin_AlreadyJoined: "41.036",
        RealmEventGetTopic_NotFound: "41.037",
        RealmWebhookTokenGet_NotFound: "41.038",
        RealmSettingsSet_InsufficientPermissions: "41.039",
        DevPanel_BotNotFound: "41.040",
        RealmThreadList_NotAuthorized: "41.041"
      },
      Express: {
        IpBanned: "42.001",
        AuthError_TokenRequired: "42.002",
        AuthError_InvalidToken: "42.003",
        MissingParameters: "42.004",
        DeleteAccountGet_InvalidToken: "42.005",
        DeleteAccountGet_UserNotFound: "42.006",
        DeleteAccountConfirm_InvalidToken: "42.007",
        DeleteAccountConfirm_UserNotFound: "42.008",
        DeleteAccountConfirm_InvalidPassword: "42.009",
        DeleteAccountConfirm_AlreadyPending: "42.010",
        DeleteAccountUndo_InvalidToken: "42.011",
        DeleteAccountUndo_PendingNotFound: "42.012",
        Login_InvalidCredentials: "42.013",
        Register_UsernameTaken: "42.014",
        Register_EmailTaken: "42.015",
        Register_InvalidName: "42.016",
        Register_InvalidPassword: "42.017",
        RegisterVerify_InvalidSession: "42.018",
        RegisterVerify_TooManyAttempts: "42.019",
        RegisterVerify_InvalidCode: "42.020",
        Announcement_ChannelIsNotOpen: "42.021",
        BotInvite_NotFound: "42.022",
        FireToken_InvalidFcToken: "42.023",
        RealmJoin: "42.024",
        RealmProfileUpload_NoPermissions: "42.025",
        FileUpload_NoFile: "42.026",
        UploadError: "42.027",
        EmojiUpload_NoPermissions: "42.028",
        EmojiUpload_Limit: "42.029",
        UserFile_FilesLimit: "42.030",
        UserFile_SizeLimit: "42.031",
        UserProfile_NoFile: "42.032",
        BotId_BotNotFound: "42.033",
        ChatId_NotFound: "42.034",
        EventId_NotFound: "42.035",
        UserId_NotFound: "42.036",
        WebhookId_NotFound: "42.037",
        InviteBot_NotPermission: "42.038"
      }
    },
    ServerError: {
      General: {},
      Socket: {
        OgEmbed_ErrorFetching: "51.001",
        RealmSettingsSet_Failed: "51.002"
      },
      Express: {
        AuthError: "52.001",
        Register_FailedToSendEmail: "52.002",
        RegisterVerify_FailedToRegisterUser: "52.003",
        UploadError: "52.004"
      }
    }
  };
  codes_default = InternalCode;
});

// back/logic/permission-system/permission.ts
function hasPermission(userPermissions, permission) {
  return (userPermissions & permission) !== 0;
}
function combinePermissions(...permissions) {
  return permissions.reduce((acc, permission) => acc | permission, 0);
}
function resetPermissions() {
  return 0;
}
function hasAllPermissionsNumber(userPermissions, requiredPermissions) {
  return (userPermissions & requiredPermissions) === requiredPermissions;
}
function hasAnyPermission(userPermissions, requiredPermissions) {
  if (requiredPermissions.length === 0)
    return true;
  return requiredPermissions.some((permission) => (userPermissions & permission) !== 0);
}
function getAllPermissions(permissions) {
  return Object.values(permissions).filter((perm) => typeof perm === "number").reduce((acc, perm) => acc | perm, 0);
}
function canChangePermissions(newPermissions, currentPermissions, managerPermissions) {
  const difference = newPermissions ^ currentPermissions;
  return (difference & ~managerPermissions) === 0;
}
var Permissions, permission_default;
var init_permission = __esm(() => {
  ((Permissions2) => {
    Permissions2[Permissions2["admin"] = 1] = "admin";
    Permissions2[Permissions2["manageMessages"] = 2] = "manageMessages";
    Permissions2[Permissions2["banUser"] = 4] = "banUser";
    Permissions2[Permissions2["muteUser"] = 8] = "muteUser";
    Permissions2[Permissions2["kickUser"] = 16] = "kickUser";
    Permissions2[Permissions2["manageRoles"] = 32] = "manageRoles";
    Permissions2[Permissions2["manageEmojis"] = 64] = "manageEmojis";
    Permissions2[Permissions2["manageInvites"] = 128] = "manageInvites";
    Permissions2[Permissions2["manageWebhooks"] = 256] = "manageWebhooks";
    Permissions2[Permissions2["manageChannels"] = 512] = "manageChannels";
  })(Permissions ||= {});
  permission_default = Permissions;
});

// back/logic/permission-system/index.ts
class PermissionSystem {
  realmRoles;
  realmUser;
  realmId;
  constructor(workspaceCollection) {
    if (!workspaceCollection)
      throw new Error("Missing required parameter workspaceCollection");
    this.realmId = workspaceCollection;
    this.realmRoles = dataBase_default.realmRoles.c(workspaceCollection);
    this.realmUser = dataBase_default.realmUser.c(workspaceCollection);
  }
  async initialize() {
    await this.validateHierarchy();
  }
  async validateHierarchy() {
    const roles = await this.getAllRolesSorted();
    if (roles.length === 0)
      return;
    const rootRoles = roles.filter((r) => r.lvl === 0);
    if (rootRoles.length > 1)
      throw new Error("System cannot have multiple root roles (lvl 0)");
    for (let i = 1;i < roles.length; i++) {
      if (roles[i].lvl <= roles[i - 1].lvl) {
        throw new Error("Role lvl must form a strict ascending chain");
      }
    }
  }
  async createRole(name, opts = {}) {
    opts = {
      lvl: null,
      p: 0,
      c: "#fff",
      managerId: false,
      ...opts
    };
    let { lvl, p, c, managerId } = opts;
    if (Array.isArray(p))
      p = combinePermissions(0, ...p);
    if (typeof p !== "number")
      throw new Error("p must be a number or array of permissions bitflags");
    if (managerId) {
      const userHighestRole = await this.getUserHighestRole(managerId);
      if (userHighestRole.lvl >= lvl && !this.isUserBeKing(managerId, userHighestRole.lvl))
        throw new Error("Invalid lvl - would break chain with user's highest role");
      const userPerms = await this.getUserPermissions(managerId);
      if (!hasAllPermissionsNumber(userPerms, p) && !this.isUserBeKing(managerId, userHighestRole.lvl))
        throw new Error("Cannot assign permissions you do not have");
    }
    const roles = await this.getAllRolesSorted();
    if (lvl === null) {
      lvl = roles.length > 0 ? roles[roles.length - 1].lvl + 1 : 0;
    } else {
      if (roles.some((r) => r.lvl === lvl)) {
        throw new Error(`lvl ${lvl} is already occupied`);
      }
      const insertIndex = roles.findIndex((r) => r.lvl > lvl);
      if (insertIndex !== -1) {
        if (insertIndex > 0 && lvl <= roles[insertIndex - 1].lvl)
          throw new Error("Invalid lvl - would break chain with previous role");
        if (insertIndex < roles.length && lvl >= roles[insertIndex].lvl)
          throw new Error("Invalid lvl - would break chain with next role");
      } else {
        lvl = roles.length > 0 ? roles[roles.length - 1].lvl + 1 : 0;
      }
    }
    return await this.realmRoles.add({
      name,
      lvl,
      p,
      c
    });
  }
  async updateRole(roleId, updates, managerId = null) {
    const role = await this.getRole(roleId);
    if (!role)
      throw new Error("Role not found");
    if (managerId) {
      const managerRoles = await this.getUserRolesSorted(managerId);
      if (!this.hasHigherRole(managerRoles, role.lvl) && !this.isUserBeKing(managerId))
        throw new Error("Insufficient permissions to edit this role");
      if (updates.p !== undefined) {
        const managerPerms = this.calculateCombinedPermissions(managerRoles);
        if (!canChangePermissions(updates.p, role.p, managerPerms) && !this.isUserBeKing(managerId))
          throw new Error("Cannot assign permissions you do not have");
      }
    }
    return await this.realmRoles.updateOne({ _id: roleId }, updates);
  }
  async deleteRole(roleId, managerId) {
    let roles = await this.getAllRolesSorted();
    if (managerId) {
      const managerHighestRole = await this.getUserHighestRole(managerId);
      if (managerHighestRole.lvl >= roles.find((r) => r._id === roleId).lvl && !this.isUserBeKing(managerId, managerHighestRole.lvl)) {
        throw new Error("Insufficient permissions to delete this role");
      }
    }
    roles = roles.filter((r) => r._id !== roleId);
    const _this = this;
    roles.forEach((role, i) => {
      role.lvl = i;
      _this.realmRoles.updateOne({ _id: role._id }, { lvl: i });
    });
    await this.realmRoles.removeOne({ _id: roleId });
    await this.realmUser.update({ $arrinc: { r: [roleId] } }, { $pull: { r: roleId } });
  }
  async assignRoleToUser(userId, roleId, managerId) {
    const role = await this.getRole(roleId);
    if (!role)
      throw new Error("Role not found");
    if (managerId !== false) {
      const managerRoles = await this.getUserRolesSorted(managerId);
      if (!this.hasHigherRole(managerRoles, role.lvl))
        throw new Error("Insufficient permissions to assign this role");
    }
    return await this.realmUser.updateOneOrAdd({ u: userId }, { $pushset: { r: roleId } }, {
      id_gen: false
    });
  }
  async removeRoleFromUser(userId, roleId, managerId) {
    const [role, managerRoles] = await Promise.all([
      this.getRole(roleId),
      this.getUserRolesSorted(managerId)
    ]);
    if (!role)
      throw new Error("Role not found");
    if (!this.hasHigherRole(managerRoles, role.lvl))
      throw new Error("Insufficient permissions to remove this role");
    return await this.realmUser.updateOne({ u: userId }, { $pull: { r: roleId } });
  }
  hasHigherRole(userRoles, targetLvl) {
    return userRoles && userRoles.some((role) => role.lvl < targetLvl);
  }
  calculateCombinedPermissions(roles) {
    if (!roles || roles.length === 0)
      return resetPermissions();
    return roles.reduce((perms, role) => combinePermissions(perms, role.p), 0);
  }
  async getRole(roleId) {
    return await this.realmRoles.findOne({ _id: roleId });
  }
  async getAllRolesSorted() {
    const roles = await this.realmRoles.find({});
    return roles.sort((a, b) => a.lvl - b.lvl);
  }
  async getUserRolesSorted(userId) {
    const userData = await this.realmUser.findOne({
      $or: [{ u: userId }, { bot: userId }]
    });
    if (!userData)
      return [];
    const userRoles = userData.r;
    if (userRoles.length === 0)
      return [];
    const rolesMap = new Map;
    const roles = await this.realmRoles.find({
      $or: userRoles.map((a) => ({ _id: a }))
    });
    roles.forEach((role) => rolesMap.set(role._id, role));
    return userRoles.map((role) => rolesMap.get(role)).filter(Boolean).sort((a, b) => a.lvl - b.lvl);
  }
  async getUserHighestRole(userId) {
    const roles = await this.getUserRolesSorted(userId);
    return roles.length > 0 ? roles[0] : null;
  }
  async canUserPerformAction(userId, requiredPermission) {
    const roles = await this.getUserRolesSorted(userId);
    const combinedPermissions = this.calculateCombinedPermissions(roles);
    return hasPermission(combinedPermissions, requiredPermission);
  }
  async canUserPerformAllActions(userId, requiredPermissions) {
    const roles = await this.getUserRolesSorted(userId);
    const combinedPermissions = this.calculateCombinedPermissions(roles);
    return requiredPermissions.every((permission) => hasPermission(combinedPermissions, permission));
  }
  async canUserPerformAnyAction(userId, permissions) {
    const roles = await this.getUserRolesSorted(userId);
    const combinedPermissions = this.calculateCombinedPermissions(roles);
    return permissions.some((permission) => hasPermission(combinedPermissions, permission));
  }
  async canManageUser(managerId, targetUserId) {
    const [managerHighestRole, targetHighestRole] = await Promise.all([
      this.getUserHighestRole(managerId),
      this.getUserHighestRole(targetUserId)
    ]);
    if (!managerHighestRole)
      return false;
    if (!targetHighestRole)
      return true;
    return managerHighestRole.lvl < targetHighestRole.lvl;
  }
  async getUserPermissions(userId) {
    const roles = await this.getUserRolesSorted(userId);
    return this.calculateCombinedPermissions(roles);
  }
  async isUserBeKing(userId, userHighestRoleLvl) {
    userHighestRoleLvl = userHighestRoleLvl || (await this.getUserHighestRole(userId))?.lvl;
    if (userHighestRoleLvl === 0)
      return true;
    const realmOwner = await dataBase_default.realmConf.c(this.realmId).findOne({
      _id: "set"
    }, {}, {
      select: ["owner"]
    });
    if (realmOwner && realmOwner.owner === userId)
      return true;
    return false;
  }
}
var init_permission_system = __esm(async () => {
  init_permission();
  await init_dataBase();
});

// back/logic/chatMgmt.ts
import { genId } from "@wxn0brp/db";
function combineId(id_1, id_2) {
  const [id1, id2] = [id_1, id_2].sort();
  const p1 = id1.split("-")[0];
  const p2 = id2.split("-")[0];
  const mix = (a, b) => a.split("-")[1].slice(0, 3) + b.split("-")[1].slice(0, 3);
  const pp = mix(id1, id2);
  const chatId = [p1, p2, pp].join("-");
  return chatId;
}
async function chatExists(chatId) {
  return await dataBase_default.realmConf.issetCollection(chatId);
}
async function createChat(name, ownerId) {
  const chatId = genId();
  await dataBase_default.realmConf.c(chatId).add({
    name,
    owner: ownerId,
    img: false,
    _id: "set"
  });
  const permSys = new PermissionSystem(chatId);
  const rootRole = await permSys.createRole("root", {
    p: getAllPermissions(permission_default)
  });
  const categoryId = genId();
  await dataBase_default.realmConf.c(chatId).add({
    cid: categoryId,
    name: "general",
    i: 0
  }, false);
  await dataBase_default.realmConf.c(chatId).add({
    chid: genId(),
    name: "main",
    type: "text",
    category: categoryId,
    i: 0,
    rp: []
  }, false);
  await dataBase_default.realmConf.c(chatId).add({
    chid: genId(),
    name: "general",
    type: "voice",
    category: categoryId,
    i: 1,
    rp: []
  }, false);
  await dataBase_default.mess.ensureCollection(chatId);
  await addUserToChat(chatId, ownerId, [rootRole._id]);
  return chatId;
}
async function addUserToChat(chatId, userId, roles = []) {
  await dataBase_default.realmUser.c(chatId).add({
    u: userId,
    r: roles
  }, false);
  await dataBase_default.userData.c(userId).add({
    realm: chatId
  }, false);
}
async function exitChat(chatId, userId) {
  await dataBase_default.realmUser.c(chatId).removeOne({ u: userId });
  await dataBase_default.userData.c(userId).removeOne({ realm: chatId });
}
async function createPriv(toId, fromId) {
  await dataBase_default.userData.c(toId).add({
    priv: fromId
  }, false);
  await dataBase_default.userData.c(fromId).add({
    priv: toId
  }, false);
  await dataBase_default.mess.ensureCollection(combineId(toId, fromId));
}
var init_chatMgmt = __esm(async () => {
  init_permission();
  await __promiseAll([
    init_permission_system(),
    init_dataBase()
  ]);
});

// back/logic/cacheSettings.ts
function getCacheSettings(settingsId) {
  const config3 = configFile[settingsId];
  if (!config3)
    return {};
  if (!Array.isArray(config3) && config3.length == 0)
    return {};
  const conf = {};
  if (config3[0])
    conf.ttl = config3[0];
  if (config3[1])
    conf.cleanupInterval = config3[1];
  return conf;
}
var configFile;
var init_cacheSettings = __esm(async () => {
  configFile = await loadConfig("cache");
});

// back/logic/checkIsUserOnRealm.ts
import { AnotherCache as AnotherCache2 } from "@wxn0brp/ac";
async function checkIsUserOnRealm(userId, realm) {
  if (cache.has(`${userId}:${realm}`))
    return cache.get(`${userId}:${realm}`);
  const result = await dataBase_default.realmUser.c(realm).findOne({
    u: userId
  });
  cache.set(`${userId}:${realm}`, !!result);
  return !!result;
}
function clearCache(userId, realm) {
  cache.delete(`${userId}:${realm}`);
}
var cache;
var init_checkIsUserOnRealm = __esm(async () => {
  await __promiseAll([
    init_dataBase(),
    init_cacheSettings()
  ]);
  cache = new AnotherCache2(getCacheSettings("UserOnRealm"));
});

// back/logic/sendMessageUtils/dm.ts
import { AnotherCache as AnotherCache3 } from "@wxn0brp/ac";
async function blocked(fr, to, combined) {
  if (blockedCache.has(combined))
    return blockedCache.get(combined);
  const blocked2 = await dataBase_default.userData.c("blocked").findOne({
    $or: [
      { fr, to },
      { fr: to, to: fr }
    ]
  });
  const isBlocked = !!blocked2;
  blockedCache.set(combined, isBlocked);
  return isBlocked;
}
async function exists(fr, to, combined) {
  if (userDmCache.has(combined))
    return userDmCache.get(combined);
  const priv = await dataBase_default.userData.c(fr).findOne({ priv: to });
  const toPriv = await dataBase_default.userData.c(to).findOne({ priv: fr });
  const exists2 = !!priv && !!toPriv;
  userDmCache.set(combined, exists2);
  return exists2;
}
async function checkDmChat(fr, to, combined, validE) {
  const isBlocked = await blocked(fr, to, combined);
  if (isBlocked)
    return validE.err(codes_default.UserError.Socket.Dm_Blocked);
  const isExists = await exists(fr, to, combined);
  if (!isExists)
    return validE.err(codes_default.UserError.Socket.Dm_NotFound);
}
function clearBlockedCache(fr, to) {
  const combined = combineId(fr, to);
  blockedCache.delete(combined);
}
function clearUserDmCache(fr, to) {
  const combined = combineId(fr, to);
  userDmCache.delete(combined);
}
var blockedCache, userDmCache, dm_default;
var init_dm = __esm(async () => {
  init_codes();
  await __promiseAll([
    init_dataBase(),
    init_chatMgmt(),
    init_cacheSettings()
  ]);
  blockedCache = new AnotherCache3(getCacheSettings("DmBlock"));
  userDmCache = new AnotherCache3(getCacheSettings("UserDm"));
  dm_default = checkDmChat;
});

// back/logic/validData.ts
import Ajv from "ajv";
import ajvFormat from "ajv-formats";
function validChannelId(data) {
  return valid.idWithPrefixOrSpecificStr(data, ["&"], ["main"]);
}
var ajv, valid, validData_default;
var init_validData = __esm(() => {
  ajv = new Ajv;
  ajvFormat(ajv);
  valid = {
    str: (str, min = 0, max = Infinity) => {
      return typeof str == "string" && str.length >= min && str.length <= max;
    },
    num: (data, min = 0, max = Infinity) => {
      return typeof data == "number" && data >= min && data <= max;
    },
    arrayContainsOnlyType: (arr, type) => {
      if (!Array.isArray(arr))
        return false;
      for (const value of arr) {
        if (typeof value !== type)
          return false;
      }
      return true;
    },
    arrayString: (arr, min = 0, max = Infinity) => {
      if (!Array.isArray(arr))
        return false;
      for (const value of arr) {
        if (!valid.str(value, min, max))
          return false;
      }
      return true;
    },
    arrayId: (arr) => {
      if (!Array.isArray(arr))
        return false;
      for (const value of arr) {
        if (!valid.id(value))
          return false;
      }
      return true;
    },
    objAjv: (schema) => {
      return ajv.compile(schema);
    },
    id: (id) => {
      if (typeof id !== "string")
        return false;
      if (id.startsWith("$"))
        id = id.replace("$", "");
      const parts = id.split("-");
      if (parts.length != 3)
        return false;
      const regex = /^[a-z0-9]+$/;
      for (const part of parts) {
        if (!regex.test(part))
          return false;
      }
      return true;
    },
    idOrSpecificStr: (data, strings = []) => {
      if (valid.id(data))
        return true;
      return strings.includes(data);
    },
    idWithPrefix: (data, prefixes = []) => {
      for (const prefix of prefixes) {
        if (prefix === false)
          return valid.id(data);
        if (data.startsWith(prefix)) {
          const remainingText = data.slice(prefix.length);
          return valid.id(remainingText);
        }
      }
      return false;
    },
    idWithPrefixOrSpecificStr: (data, prefixes = [], strings = []) => {
      if (valid.idWithPrefix(data, prefixes))
        return true;
      return valid.idOrSpecificStr(data, strings);
    },
    bool: (data) => {
      return typeof data == "boolean";
    }
  };
  validData_default = valid;
  ajv.addKeyword({
    keyword: "channelRP",
    type: "string",
    compile: function() {
      return function(data) {
        const parts = data.split("/");
        if (parts.length !== 2)
          return false;
        const [id, perm] = parts;
        return valid.id(id) && valid.num(parseInt(perm));
      };
    }
  });
  ajv.addKeyword({
    keyword: "validId",
    type: "string",
    compile: function() {
      return valid.id;
    }
  });
  ajv.addKeyword({
    keyword: "validIdWithPrefix",
    type: "string",
    validate: function(schema, data) {
      if (typeof data !== "string")
        return false;
      for (let prefix of schema) {
        if (prefix === false)
          return valid.id(data);
        if (data.startsWith(prefix)) {
          const remainingText = data.slice(prefix.length);
          return valid.id(remainingText);
        }
      }
      return false;
    }
  });
});

// back/logic/validError.ts
class ValidError {
  module;
  constructor(module) {
    this.module = module;
  }
  valid(...err) {
    return {
      err: ["error.valid", this.module, ...err]
    };
  }
  err(...err) {
    return {
      err: ["error", this.module, ...err]
    };
  }
}

// back/logic/status.ts
import { AnotherCache as AnotherCache4 } from "@wxn0brp/ac";
function setCache(userId, state) {
  let endTime = state.endTime;
  if (state.endTime) {
    if (state.endTime < Date.now())
      return 1;
    if (state.endTime < state.startTime)
      return 2;
    endTime = state.endTime;
  }
  if (state.startTime > Date.now())
    state.startTime = Date.now();
  let ttl = endTime - Date.now();
  if (ttl > h2) {
    endTime = Date.now() + h2;
    state.endTime = endTime;
  }
  if (endTime) {
    cache2.set(userId, state, ttl);
  } else {
    cache2.set(userId, state);
  }
  return 0;
}
function getCache(userId) {
  return cache2.get(userId);
}
function rmCache(userId) {
  cache2.delete(userId);
}
var h2, cache2;
var init_status = __esm(async () => {
  await init_cacheSettings();
  h2 = 2 * 60 * 60 * 1000;
  cache2 = new AnotherCache4(getCacheSettings("UserStatus"));
});

// back/socket/chat/logic/friends.ts
async function friend_request(suser, nameOrId) {
  const validE = new ValidError("friend.request");
  if (!validData_default.str(nameOrId, 0, 30) && !validData_default.id(nameOrId))
    return validE.valid("nameOrId");
  const userExists = await dataBase_default.data.c("user").findOne({
    $or: [{ name: nameOrId }, { _id: nameOrId }]
  });
  if (!userExists)
    return validE.err(codes_default.UserError.Socket.FriendRequest_UserNotFound);
  if (userExists._id == suser._id)
    return validE.err(codes_default.UserError.Socket.FriendRequest_Self);
  const id = userExists._id;
  const friendExists = await dataBase_default.dataGraph.c("friends").findOne({ $or: [{ a: suser._id, b: id }, { a: id, b: suser._id }] });
  if (friendExists)
    return validE.err(codes_default.UserError.Socket.FriendRequest_AlreadyFriend);
  const friendRequestExists = await dataBase_default.data.c("friendRequests").find({
    $or: [
      { from: id, to: suser._id },
      { from: suser._id, to: id }
    ]
  });
  if (friendRequestExists.length > 0)
    return validE.err(codes_default.UserError.Socket.FriendRequest_AlreadySent);
  await dataBase_default.data.c("friendRequests").add({ from: suser._id, to: id }, false);
  sendToUser(id, "friend.request", suser._id);
  await firebaseSend({
    to: id,
    title: "Friend request",
    body: suser.name + " wants to be your friend"
  });
  return { err: false };
}
async function friend_response(suser, id, accept) {
  const validE = new ValidError("friend.response");
  if (!validData_default.id(id))
    return validE.valid("id");
  if (!validData_default.bool(accept))
    return validE.valid("accept");
  await dataBase_default.data.c("friendRequests").removeOne({ from: id, to: suser._id });
  const friendExists = await dataBase_default.dataGraph.c("friends").findOne({ $or: [{ a: suser._id, b: id }, { a: id, b: suser._id }] });
  if (friendExists)
    return validE.err(codes_default.UserError.Socket.FriendRequest_AlreadyFriend);
  if (accept)
    await dataBase_default.dataGraph.c("friends").add({ a: id, b: suser._id }, false);
  sendToUser(id, "friend.response", suser._id, accept);
  if (accept)
    sendToUser(suser._id, "refreshData", "friend.get.all");
  firebaseSend({
    to: id,
    title: "Friend request",
    body: suser.name + (accept ? " accepted your friend request" : " rejected your friend request")
  });
  return { err: false };
}
async function friend_request_remove(suser, id) {
  const validE = new ValidError("friend.request.remove");
  if (!validData_default.id(id))
    return validE.valid("id");
  await dataBase_default.data.c("friendRequests").removeOne({ from: suser._id, to: id });
  sendToUser(id, "refreshData", "friend.requests.get");
  return { err: false };
}
async function friend_remove(suser, id) {
  const validE = new ValidError("friend.remove");
  if (!validData_default.id(id))
    return validE.valid("id");
  const friendExists = await dataBase_default.dataGraph.c("friends").findOne({ $or: [{ a: suser._id, b: id }, { a: id, b: suser._id }] });
  if (!friendExists)
    return validE.err(codes_default.UserError.Socket.FriendRemove_FriendNotFound);
  await dataBase_default.dataGraph.c("friends").removeOne({ $or: [{ a: suser._id, b: id }, { a: id, b: suser._id }] });
  sendToUser(id, "refreshData", "friend.get.all");
  sendToUser(suser._id, "refreshData", "friend.get.all");
  return { err: false };
}
async function friend_get_all(suser) {
  const friendsGraph = await dataBase_default.dataGraph.c("friends").find({ $or: [{ a: suser._id }, { b: suser._id }] });
  const friends = friendsGraph.map((f) => {
    if (f.a == suser._id)
      return f.b;
    return f.a;
  });
  const friendsStatusPromises = friends.map(async (f) => {
    const userOnline = io.room("user-" + f).size;
    if (userOnline == 0)
      return {
        _id: f,
        status: "offline"
      };
    const status = await dataBase_default.userData.c(f).findOne({
      _id: "status"
    });
    return {
      _id: f,
      status: status?.status || "online",
      text: status?.text || ""
    };
  });
  const friendsStatus = await Promise.all(friendsStatusPromises);
  return { err: false, res: [friendsStatus] };
}
async function friend_requests_get(suser) {
  const friendRequestsData = await dataBase_default.data.c("friendRequests").find({ to: suser._id });
  const friendRequests = friendRequestsData.map((f) => f.from);
  return { err: false, res: [friendRequests] };
}
async function user_profile(suser, id) {
  const validE = new ValidError("user.profile");
  if (!validData_default.id(id))
    return validE.valid("id");
  const userN = await dataBase_default.data.c("user").findOne({ _id: id });
  if (!userN)
    return validE.err(codes_default.UserError.Socket.UserProfile_UserNotFound);
  let userStatus = await dataBase_default.userData.c(id).findOne({ _id: "status" });
  const userOnline = io.room("user-" + id).size > 0;
  if (!userStatus)
    userStatus = {};
  let userStatusType = "";
  let userStatusText = "";
  if (userOnline)
    userStatusType = userStatus?.status || "online";
  if (userOnline && userStatus.text)
    userStatusText = userStatus?.text;
  if (!userOnline && !userStatusType)
    userStatusType = "offline";
  let friendStatus = 0 /* NOT_FRIEND */;
  const isFriend = await dataBase_default.dataGraph.c("friends").findOne({ $or: [{ a: suser._id, b: id }, { a: id, b: suser._id }] });
  if (isFriend) {
    friendStatus = 1 /* IS_FRIEND */;
  } else {
    const isFriendRequest = await dataBase_default.data.c("friendRequests").findOne({
      $or: [
        { from: suser._id, to: id },
        { from: id, to: suser._id }
      ]
    });
    if (isFriendRequest) {
      friendStatus = isFriendRequest.from == suser._id ? 2 /* REQUEST_SENT */ : 3 /* REQUEST_RECEIVED */;
    }
  }
  const userIsBlocked = await dataBase_default.data.c("blocked").findOne({
    fr: suser._id,
    to: id
  });
  const userData = {
    name: userN.name,
    status: userStatusType,
    statusText: userStatusText,
    _id: id,
    friendStatus,
    isBlocked: !!userIsBlocked,
    activity: getCache(id) || {}
  };
  return { err: false, res: [userData] };
}
var init_friends = __esm(async () => {
  init_codes();
  init_validData();
  init_server();
  await __promiseAll([
    init_dataBase(),
    init_firebase(),
    init_status(),
    init_socket()
  ]);
});

// back/logic/processDbChanges.ts
function processDbChanges(oldData, newData, trackParams = [], idName = "_id") {
  const itemsToAdd = newData.filter((newItem) => !oldData.some((oldItem) => oldItem[idName] === newItem[idName]));
  const itemsToRemove = oldData.filter((oldItem) => !newData.some((newItem) => newItem[idName] === oldItem[idName]));
  const itemsToUpdate = newData.filter((newItem) => {
    const oldItem = oldData.find((oldItem2) => oldItem2[idName] === newItem[idName]);
    return oldItem && !areObjectsEqual(newItem, oldItem, trackParams);
  });
  const itemsWithRemovedFields = itemsToUpdate.map((newItem) => {
    const oldItem = oldData.find((oldItem2) => oldItem2[idName] === newItem[idName]);
    const deletedParams = findDeletedParams(oldItem, newItem, trackParams);
    return { [idName]: newItem[idName], deletedParams };
  }).filter((item) => item.deletedParams.length > 0);
  return { itemsToAdd, itemsToRemove, itemsToUpdate, itemsWithRemovedFields };
}
function areObjectsEqual(obj1, obj2, params) {
  return params.every((param) => {
    const val1 = obj1[param];
    const val2 = obj2[param];
    if (Array.isArray(val1) && Array.isArray(val2)) {
      return arrayDeepEqual(val1, val2);
    }
    if (typeof val1 === "object" && val1 !== null && typeof val2 === "object" && val2 !== null) {
      return areObjectsEqual(val1, val2, Object.keys(val1));
    }
    return val1 === val2;
  });
}
function arrayDeepEqual(arr1, arr2) {
  if (arr1.length !== arr2.length)
    return false;
  return arr1.every((item, index) => {
    const otherItem = arr2[index];
    if (Array.isArray(item) && Array.isArray(otherItem)) {
      return arrayDeepEqual(item, otherItem);
    }
    if (typeof item === "object" && item !== null && typeof otherItem === "object" && otherItem !== null) {
      return areObjectsEqual(item, otherItem, Object.keys(item));
    }
    return item === otherItem;
  });
}
function findDeletedParams(oldItem, newItem, params) {
  return params.filter((param) => !(param in newItem) && (param in oldItem));
}
// back/types/db/realmConf.ts
var init_realmConf = () => {};

// back/socket/chat/logic/realmSettings/set/imports.ts
var init_imports = __esm(async () => {
  init_realmConf();
  init_permission();
  await __promiseAll([
    init_permission_system(),
    init_dataBase()
  ]);
});

// back/socket/chat/logic/chats.ts
async function realm_get(suser) {
  const realms = await dataBase_default.userData.c(suser._id).find({ $exists: { realm: true } });
  if (realms.length == 0)
    return { err: false, res: [[]] };
  for (let i = 0;i < realms.length; i++) {
    const realm = realms[i];
    const id = realm.realm;
    const realmSet = await dataBase_default.realmConf.c(id).findOne({
      _id: "set"
    });
    realm.img = realmSet.img || false;
    const permSys = new PermissionSystem(realm.realm);
    const userPerm = await permSys.getUserPermissions(suser._id);
    realm.p = userPerm;
  }
  return { err: false, res: [realms] };
}
async function dm_get(suser) {
  const privs = await dataBase_default.userData.c(suser._id).find({ $exists: { priv: true } });
  if (privs.length == 0)
    return { err: false, res: [[]] };
  for (let i = 0;i < privs.length; i++) {
    const priv = privs[i];
    const id = combineId(suser._id, priv.priv);
    const lastMess = await dataBase_default.mess.c(id).find({}, { reverse: true, limit: 1 });
    if (lastMess.length == 0)
      continue;
    priv.lastMessId = lastMess[0]._id;
  }
  const blocked2 = (await dataBase_default.userData.c("blocked").find({
    $or: [{ fr: suser._id }, { to: suser._id }]
  })).map((block) => {
    const userIsFr = block.fr == suser._id;
    const to = userIsFr ? block.to : block.fr;
    const exists2 = privs.some((priv) => priv.priv == to);
    if (!exists2)
      return;
    return userIsFr ? { block: to } : { blocked: to };
  }).filter(Boolean);
  return { err: false, res: [privs, blocked2] };
}
async function realm_create(suser, name) {
  const validE = new ValidError("realm.create");
  if (!validData_default.str(name, 0, 30))
    return validE.valid("name");
  createChat(name, suser._id);
  return { err: false };
}
async function realm_exit(suser, id) {
  const validE = new ValidError("realm.exit");
  if (!validData_default.id(id))
    return validE.valid("id");
  await exitChat(id, suser._id);
  sendToUser(suser._id, "refreshData", "realm.get");
  clearCache(suser._id, id);
  return { err: false };
}
async function dm_create(suser, nameOrId) {
  const validE = new ValidError("dm.create");
  if (!validData_default.str(nameOrId, 0, 30) && !validData_default.id(nameOrId))
    return validE.valid("nameOrId");
  if (nameOrId == suser._id || nameOrId == suser.name)
    return validE.err(codes_default.UserError.Socket.Dm_CreateSelf);
  const user = await dataBase_default.data.c("user").findOne({
    $or: [{ name: nameOrId }, { _id: nameOrId }]
  });
  if (user._id == suser._id)
    return validE.err(codes_default.UserError.Socket.Dm_CreateSelf);
  if (!user)
    return validE.err(codes_default.UserError.Socket.Dm_UserNotFound);
  const toId = user._id;
  const priv = await dataBase_default.userData.c(suser._id).findOne({
    priv: toId
  });
  if (priv)
    return validE.err(codes_default.UserError.Socket.Dm_AlreadyExists);
  await createPriv(toId, suser._id);
  sendToUser(suser._id, "refreshData", "dm.get");
  sendToUser(toId, "refreshData", "dm.get");
  clearUserDmCache(suser._id, toId);
  return { err: false };
}
async function realm_join(suser, id) {
  const validE = new ValidError("realm.join");
  if (!validData_default.id(id))
    return validE.valid("id");
  const exists2 = await dataBase_default.userData.c(suser._id).findOne({ realm: id });
  if (exists2)
    return validE.err(codes_default.UserError.Socket.RealmJoin_AlreadyJoined);
  const isBaned = await dataBase_default.realmData.c(id).findOne({ ban: suser._id });
  if (isBaned)
    return validE.err(codes_default.UserError.Socket.RealmJoin_UserIsBanned);
  await addUserToChat(id, suser._id);
  sendToUser(suser._id, "refreshData", "realm.get");
  clearCache(suser._id, id);
  return { err: false };
}
async function realm_mute(suser, id, time) {
  const validE = new ValidError("realm.mute");
  if (!validData_default.id(id))
    return validE.valid("id");
  if (!validData_default.num(time, -1))
    return validE.valid("time");
  const isUserInRealm = await checkIsUserOnRealm(suser._id, id);
  if (!isUserInRealm)
    return validE.err(codes_default.UserError.Socket.UserNotOnRealm);
  await dataBase_default.userData.c(suser._id).updateOne({ realm: id }, { muted: time });
  return { err: false };
}
async function dm_block(suser, id, blocked2) {
  const validE = new ValidError("dm.block");
  if (!validData_default.id(id))
    return validE.valid("id");
  if (!validData_default.bool(blocked2))
    return validE.valid("blocked");
  if (blocked2) {
    const exists2 = await dataBase_default.userData.c("blocked").findOne({
      fr: suser._id,
      to: id
    });
    if (exists2)
      return validE.err(codes_default.UserError.Socket.Dm_BlockAlreadyBlocked);
    await dataBase_default.userData.c("blocked").add({ fr: suser._id, to: id }, false);
    await friend_remove(suser, id);
  } else {
    await dataBase_default.userData.c("blocked").removeOne({ fr: suser._id, to: id });
  }
  clearBlockedCache(suser._id, id);
  sendToUser(suser._id, "refreshData", "dm.get");
  sendToUser(id, "refreshData", "dm.get");
  return { err: false };
}
var init_chats = __esm(async () => {
  init_codes();
  init_validData();
  await __promiseAll([
    init_dataBase(),
    init_chatMgmt(),
    init_checkIsUserOnRealm(),
    init_dm(),
    init_friends(),
    init_imports(),
    init_socket()
  ]);
});

// back/logic/chnlPermissionCache.ts
import { AnotherCache as AnotherCache5 } from "@wxn0brp/ac";
function parseCacheKey(key) {
  const [realm, chnl, userId] = key.split(":");
  return { realm, chnl, userId };
}
async function fetchChannelsPermissions(realm) {
  let cachedPermissions = channelPermissionsCache.get(realm);
  if (cachedPermissions)
    return cachedPermissions;
  const channels = await dataBase_default.realmConf.c(realm).find({ $exists: { chid: true } });
  const permissions = channels.reduce((acc, channel) => {
    const rp = channel.rp;
    const chnlId = channel.chid;
    if (rp.length == 0) {
      acc[chnlId] = "non-defined";
      return acc;
    }
    const perms = {};
    rp.forEach((r) => {
      const [role, perm] = r.split("/");
      const p = parseInt(perm);
      perms[role] = p;
    });
    acc[chnlId] = perms;
    return acc;
  }, {});
  channelPermissionsCache.set(realm, permissions);
  return permissions;
}
async function fetchUserRoles(realm, userId) {
  const permSys = new PermissionSystem(realm);
  return await permSys.getUserRolesSorted(userId);
}

class PermissionCache {
  constructor() {}
  async getPermissions(realm, chnl, userId) {
    const cacheKey = generateCacheKey(realm, chnl, userId);
    let cachedPermissions = cache3.get(cacheKey);
    if (cachedPermissions)
      return cachedPermissions;
    const [channelsPermissions, userRoles] = await Promise.all([
      fetchChannelsPermissions(realm),
      fetchUserRoles(realm, userId)
    ]);
    const channelPermissions = channelsPermissions[chnl] || {};
    if (channelPermissions === "non-defined") {
      const allPerms = getAllPermissions(permissionFlags);
      cache3.set(cacheKey, allPerms);
      return allPerms;
    } else {
      const userPermissions = userRoles.reduce((acc, role) => {
        const rolePermissions = channelPermissions[role._id] || 0;
        return acc | rolePermissions;
      }, 0);
      cache3.set(cacheKey, userPermissions);
      return userPermissions;
    }
  }
  async getAllUserPermissions(userId) {
    const keys = cache3.keys().filter((key) => key.endsWith(`:${userId}`));
    const permissions = {};
    for (const key of keys) {
      const { realm, chnl } = parseCacheKey(key);
      permissions[realm] = permissions[realm] || {};
      permissions[realm][chnl] = cache3.get(key);
    }
    return permissions;
  }
  async getAllRealmPermissions(realm) {
    const keys = cache3.keys().filter((key) => key.startsWith(`${realm}:`));
    const permissions = {};
    for (const key of keys) {
      const { chnl, userId } = parseCacheKey(key);
      permissions[chnl] = permissions[chnl] || {};
      permissions[chnl][userId] = cache3.get(key);
    }
    return permissions;
  }
  async getUserPermissionsInRealm(realm, userId) {
    const keys = cache3.keys().filter((key) => key.startsWith(`${realm}:`) && key.endsWith(`:${userId}`));
    const permissions = {};
    for (const key of keys) {
      const { chnl } = parseCacheKey(key);
      permissions[chnl] = cache3.get(key);
    }
    return permissions;
  }
  async getAllChannelsInRealm(realm) {
    const permissions = await fetchChannelsPermissions(realm);
    return Object.keys(permissions);
  }
  async getAllRolesInChannel(realm, chnl) {
    const channelsPermissions = await fetchChannelsPermissions(realm);
    return Object.keys(channelsPermissions[chnl] || {});
  }
  clearRealmCache(realm) {
    const keys = cache3.keys().filter((key) => key.startsWith(`${realm}:`));
    keys.forEach((key) => cache3.delete(key));
  }
  clearChannelCache(realm, chnl) {
    const keys = cache3.keys().filter((key) => key.startsWith(`${realm}:${chnl}:`));
    keys.forEach((key) => cache3.delete(key));
  }
  clearAllCache() {
    cache3.clear();
    channelPermissionsCache.clear();
  }
}
async function getChnlPerm(user, realm, chnl) {
  const cached = cache3.get(generateCacheKey(realm, chnl, user));
  if (cached)
    return mapPermissionsToFlags(cached);
  const permSys = new PermissionSystem(realm);
  const admin2 = await permSys.canUserPerformAction(user, permission_default.admin);
  const perms = admin2 ? -1 : await permissionCache.getPermissions(realm, chnl, user);
  return mapPermissionsToFlags(perms);
}
function mapPermissionsToFlags(perms) {
  const allPerms = {};
  const keys = Object.keys(permissionFlags);
  keys.forEach((k) => {
    allPerms[k] = perms === -1 || hasPermission(perms, permissionFlags[k]);
  });
  return allPerms;
}
var cache3, channelPermissionsCache, generateCacheKey = (realm, chnl, userId) => `${realm}:${chnl}:${userId}`, permissionCache, permissionFlags;
var init_chnlPermissionCache = __esm(async () => {
  init_permission();
  await __promiseAll([
    init_permission_system(),
    init_dataBase(),
    init_cacheSettings()
  ]);
  cache3 = new AnotherCache5(getCacheSettings("ChnlPermission"));
  channelPermissionsCache = new AnotherCache5(getCacheSettings("ChnlPermission_Channels"));
  permissionCache = new PermissionCache;
  ((permissionFlags2) => {
    permissionFlags2[permissionFlags2["view"] = 1] = "view";
    permissionFlags2[permissionFlags2["write"] = 2] = "write";
    permissionFlags2[permissionFlags2["file"] = 4] = "file";
    permissionFlags2[permissionFlags2["react"] = 8] = "react";
    permissionFlags2[permissionFlags2["threadCreate"] = 16] = "threadCreate";
    permissionFlags2[permissionFlags2["threadView"] = 32] = "threadView";
    permissionFlags2[permissionFlags2["threadWrite"] = 64] = "threadWrite";
  })(permissionFlags ||= {});
});

// back/logic/sendMessageUtils/announcementChnl.ts
import { AnotherCache as AnotherCache6 } from "@wxn0brp/ac";
async function announcementChnl(realm, data) {
  const subs = await getSubscribed(realm, data.chnl);
  if (subs.length == 0)
    return;
  subs.forEach(async ({ tr, tc }) => {
    const req = {
      to: tr,
      msg: data.msg,
      chnl: tc
    };
    const user = {
      _id: combineId(tr, tc),
      name: "Event Chnl"
    };
    const opts = {
      system: true,
      frPrefix: "("
    };
    sendMessage(req, user, opts);
  });
}
async function getSubscribed(realm, chnl) {
  let realmData = announcementSubscribeCache.get(realm);
  if (!realmData) {
    const chnls = await dataBase_default.realmData.c("announcement.channels").find({ sr: realm });
    realmData = {};
    chnls.forEach(({ sr, sc, tr, tc }) => {
      const key2 = `${sr}:${sc}`;
      if (!realmData[key2]) {
        realmData[key2] = [];
      }
      realmData[key2].push({ tr, tc });
    });
    announcementSubscribeCache.set(realm, realmData);
  }
  const key = `${realm}:${chnl}`;
  return realmData[key] || [];
}
function clearEventCache(realm) {
  announcementSubscribeCache.delete(realm);
}
var announcementSubscribeCache, announcementChnl_default;
var init_announcementChnl = __esm(async () => {
  await __promiseAll([
    init_dataBase(),
    init_chatMgmt(),
    init_sendMessage(),
    init_cacheSettings()
  ]);
  announcementSubscribeCache = new AnotherCache6(getCacheSettings("AnnouncementSubscribe"));
  announcementChnl_default = announcementChnl;
});

// back/logic/sendMessage.ts
async function sendMessage(req, user, options = {}) {
  options = prepareOptions(options);
  const errs = validData(req, user, options);
  if (errs)
    return errs;
  const processed = await processIdAndPerm(req, user, options);
  if (processed.err)
    return processed;
  const privChat = processed.res.privChat;
  const originalTo = req.to;
  const processedTo = processed.res.to;
  let data = {
    fr: options.frPrefix + user._id,
    msg: req.msg.trim(),
    chnl: req.chnl,
    ...options.customFields || {}
  };
  if (req.enc)
    data.enc = req.enc;
  if (req.res)
    data.res = req.res;
  const message = await dataBase_default.mess.c(processedTo).add(data);
  data._id = message._id;
  if (req.silent)
    data.silent = req.silent || false;
  sendToUser(user._id, "mess", Object.assign({ to: originalTo }, data));
  if (privChat)
    sendDmNotification(originalTo, user, data);
  else
    await sendReamNotification(originalTo, user, data);
  return { err: false };
}
function prepareOptions(options) {
  options = {
    system: false,
    minMsg: 0,
    maxMsg: 2000,
    frPrefix: "",
    ...options
  };
  return options;
}
function validData(req, user, options = {}) {
  if (!user)
    return validE.err(codes_default.UserError.Socket.NotAuthorized);
  if (typeof req !== "object")
    return validE.valid("req");
  if (!validData_default.id(req.to))
    return validE.valid("to");
  if (!validChannelId(req.chnl))
    return validE.valid("chnl");
  if (!validData_default.str(req.msg, options.minMsg, options.maxMsg))
    return validE.valid("msg");
  if (req.enc && !validData_default.str(req.enc, 0, 30))
    return validE.valid("enc");
  if (req.res && !validData_default.id(req.res))
    return validE.valid("res");
  if (req.silent && !validData_default.bool(req.silent))
    return validE.valid("silent");
}
async function processIdAndPerm(req, user, options) {
  let { to, chnl } = req;
  const privChat = to.startsWith("$");
  if (privChat) {
    let p1 = user._id;
    let p2 = to.replace("$", "");
    to = combineId(p1, p2);
    const checkData = await dm_default(p1, p2, to, validE);
    if (checkData)
      return checkData;
    await dataBase_default.mess.ensureCollection(to);
  } else {
    const chatExists2 = await chatExists(to);
    if (!chatExists2)
      return validE.err(codes_default.UserError.Socket.ChatIsNotFound);
  }
  if (!privChat && !options.system) {
    const perm = await getChnlPerm(user._id, to, chnl);
    if (!perm.view)
      return validE.err(codes_default.UserError.Socket.ChannelIsNotFound);
    if (!perm.write)
      return validE.err(codes_default.UserError.Socket.NoPermissionToWriteMessage);
    if (chnl.startsWith("&") && !perm.threadWrite)
      return validE.err(codes_default.UserError.Socket.NoPermissionToWriteMessage);
  }
  return { err: false, res: { to, privChat } };
}
async function sendReamNotification(to, user, data) {
  const realm = await dataBase_default.realmConf.c(to).findOne({
    _id: "set"
  });
  const fromMsg = `${realm.name} @${user.name}`;
  data.to = to;
  dataBase_default.realmUser.c(to).find({ $exists: { u: true } }).then((chat) => {
    chat.forEach(async (chat_user) => {
      const uid = chat_user.u;
      if (uid == user._id)
        return;
      const realm2 = await dataBase_default.userData.c(uid).findOne({
        realm: to
      });
      if (realm2 && realm2.muted && realm2.muted != -1) {
        const muted = realm2.muted;
        if (muted == 0)
          return;
        if (muted > new Date().getTime())
          return;
      }
      sendToUser(uid, "mess", data);
      if (data.silent)
        return;
      firebaseSend({
        to: uid,
        title: "New message from " + fromMsg,
        body: data.msg,
        action: {
          type: "ctrl",
          data: [["cc", data.to + "_" + data.chnl]]
        }
      });
    });
  });
  dataBase_default.realmUser.c(to).find({ $exists: { bot: true } }).then((botUsers) => {
    botUsers.forEach((bot) => {
      io.room("bot-" + bot.bot).emit("mess", data);
    });
  });
  await announcementChnl_default(to, data);
}
function sendDmNotification(to, user, data) {
  const toSend = to.replace("$", "");
  data.to = "$" + user._id;
  sendToUser(toSend, "mess", data);
  if (data.silent)
    return;
  firebaseSend({
    to: toSend,
    title: "New message from " + user.name,
    body: data.msg,
    action: { type: "ctrl", data: [["chat", "$" + user._id]] }
  });
}
var validE;
var init_sendMessage = __esm(async () => {
  init_validData();
  init_codes();
  init_server();
  await __promiseAll([
    init_chatMgmt(),
    init_chnlPermissionCache(),
    init_dataBase(),
    init_dm(),
    init_announcementChnl(),
    init_firebase(),
    init_socket()
  ]);
  validE = new ValidError("mess");
});

// back/logic/utils.ts
function extractTimeFromId(id) {
  if (!id)
    return;
  const timePart = id.split("-")[0];
  const timeUnix = parseInt(timePart, 36);
  return timeUnix;
}

// back/socket/chat/valid/messageSearch.ts
var messageSearch_default;
var init_messageSearch = __esm(() => {
  messageSearch_default = {
    type: "object",
    properties: {
      from: {
        type: "string",
        validId: true
      },
      mentions: {
        type: "string",
        validId: true
      },
      before: {
        oneOf: [
          { type: "string", format: "date-time" },
          { type: "string", format: "date" }
        ]
      },
      during: {
        type: "string",
        format: "date"
      },
      after: {
        oneOf: [
          { type: "string", format: "date-time" },
          { type: "string", format: "date" }
        ]
      },
      pinned: {
        type: "boolean"
      },
      message: {
        type: "string",
        minLength: 1,
        maxLength: 500
      }
    },
    additionalProperties: false
  };
});

// back/socket/chat/valid/event.ts
var event_default;
var init_event = __esm(() => {
  event_default = {
    type: "object",
    properties: {
      type: { type: "string", enum: ["voice", "custom"] },
      where: { type: "string" },
      topic: { type: "string" },
      time: { type: "number" },
      desc: { type: "string" },
      img: { type: "string" }
    },
    required: ["type", "where", "topic", "time"],
    additionalProperties: false
  };
});

// back/socket/chat/logic/realms.ts
async function realm_setup(suser, id) {
  const validE2 = new ValidError("realm.setup");
  if (!validData_default.id(id))
    return validE2.valid("id");
  const isUserInRealm = await checkIsUserOnRealm(suser._id, id);
  if (!isUserInRealm)
    return validE2.err(codes_default.UserError.Socket.UserNotOnRealm);
  const realmMeta = await dataBase_default.realmConf.c(id).findOne({
    _id: "set"
  });
  if (!realmMeta)
    return validE2.err(codes_default.UserError.Socket.RealmSetup_RealmNotFound);
  const name = realmMeta.name;
  const permSys = new PermissionSystem(id);
  const buildChannels = [];
  const categories = await dataBase_default.realmConf.c(id).find({
    $exists: { cid: true }
  });
  const channels = await dataBase_default.realmConf.c(id).find({ $exists: { chid: true } });
  const sortedCategories = categories.sort((a, b) => a.i - b.i);
  for (let i = 0;i < sortedCategories.length; i++) {
    const category = sortedCategories[i];
    let chnlsByDb = channels.filter((c) => c.category == category.cid).sort((a, b) => a.i - b.i);
    const allChnls = await Promise.all(chnlsByDb.map(async (c) => {
      const perms = await getChnlPerm(suser._id, id, c.chid);
      if (!perms)
        return null;
      if (!perms.view)
        return null;
      return {
        id: c.chid,
        name: c.name,
        type: c.type,
        perms,
        desc: c.desc
      };
    }));
    const chnls = allChnls.filter(Boolean);
    if (chnlsByDb.length == 0)
      continue;
    buildChannels.push({
      id: category.cid,
      name: category.name,
      chnls
    });
  }
  const userPermissions = await permSys.getUserPermissions(suser._id);
  return { err: false, res: [id, name, buildChannels, userPermissions] };
}
async function realm_users_sync(suser, id) {
  const validE2 = new ValidError("realm.users.sync");
  if (!validData_default.id(id))
    return validE2.valid("id");
  const isUserInRealm = await checkIsUserOnRealm(suser._id, id);
  if (!isUserInRealm)
    return validE2.err(codes_default.UserError.Socket.UserNotOnRealm);
  const permSys = new PermissionSystem(id);
  const roles = await permSys.getAllRolesSorted();
  const rolesData = roles.map(({ name, c }) => {
    return { name, c };
  });
  const rolesMap = new Map;
  for (const role of roles)
    rolesMap.set(role._id, role.name);
  const users = await dataBase_default.realmUser.c(id).find({});
  const usersData = users.map((u) => {
    const uid = u.u || u.bot;
    let symbolUID = uid;
    if (u.bot)
      symbolUID = "^" + u.bot;
    return {
      uid: symbolUID,
      roles: u.r.map((r) => rolesMap.get(r))
    };
  });
  return { err: false, res: [usersData, rolesData] };
}
async function realm_users_activity_sync(suser, id) {
  const validE2 = new ValidError("realm.users.activity.sync");
  if (!validData_default.id(id))
    return validE2.valid("id");
  const isUserInRealm = await checkIsUserOnRealm(suser._id, id);
  if (!isUserInRealm)
    return validE2.err(codes_default.UserError.Socket.UserNotOnRealm);
  const users = await dataBase_default.realmUser.c(id).find({});
  const usersData = users.map(async (u) => {
    const uid = u.u || u.bot;
    let symbolUID = uid;
    if (u.bot)
      symbolUID = "^" + u.bot;
    let userOnline = false;
    if (u.u)
      userOnline = io.room("user-" + uid).size > 0;
    if (u.bot)
      userOnline = io.room("bot-" + uid).size > 0;
    if (!userOnline)
      return { uid: symbolUID };
    const st = await dataBase_default.userData.c(uid).findOne({
      _id: "status"
    });
    const statusText = st?.text;
    const status = st?.status || "online";
    return {
      uid: symbolUID,
      activity: getCache(uid),
      status,
      statusText
    };
  });
  const res = await Promise.all(usersData);
  return { err: false, res: [res] };
}
async function realm_delete(suser, id, name) {
  const validE2 = new ValidError("realm.delete");
  if (!validData_default.id(id))
    return validE2.valid("id");
  if (!validData_default.str(name, 0, 30))
    return validE2.valid("name");
  const realmMeta = await dataBase_default.realmConf.c(id).findOne({
    _id: "set"
  });
  if (realmMeta.name != name)
    return validE2.valid("name");
  const permSys = new PermissionSystem(id);
  const userPerm = await permSys.canUserPerformAction(suser._id, permission_default.admin);
  if (!userPerm)
    return validE2.err(codes_default.UserError.Socket.RealmEdit_NotAuthorized);
  const users = await dataBase_default.realmUser.c(id).find({}).then((users2) => users2.map((u) => u.u));
  for (const user of users)
    await dataBase_default.userData.c(user).removeOne({ realm: id });
  dataBase_default.realmConf.removeCollection(id);
  dataBase_default.realmUser.removeCollection(id);
  dataBase_default.mess.removeCollection(id);
  dataBase_default.realmData.removeCollection(id);
  for (const user of users)
    sendToUser(user, "refreshData", "realm.get");
  return { err: false };
}
async function realm_user_kick(suser, realmId, uid, ban = false) {
  const validE2 = new ValidError("realm.user.kick");
  if (!validData_default.id(realmId))
    return validE2.valid("realmId");
  if (!validData_default.id(uid))
    return validE2.valid("uid");
  if (!validData_default.bool(ban))
    return validE2.valid("ban");
  const permSys = new PermissionSystem(realmId);
  const userPerm = await permSys.canUserPerformAnyAction(suser._id, [
    permission_default.admin,
    permission_default.banUser,
    permission_default.kickUser
  ]);
  if (!userPerm)
    return validE2.err(codes_default.UserError.Socket.RealmEdit_NotAuthorized);
  await dataBase_default.userData.c(uid).removeOne({ realm: realmId });
  await dataBase_default.realmUser.c(realmId).removeOne({ uid });
  if (ban) {
    await dataBase_default.realmUser.c(realmId).add({ ban: uid }, false);
  }
  sendToUser(uid, "refreshData", "realm.get");
  return { err: false };
}
async function realm_user_unban(suser, realmId, uid) {
  const validE2 = new ValidError("realm.user.unban");
  if (!validData_default.id(realmId))
    return validE2.valid("realmId");
  if (!validData_default.id(uid))
    return validE2.valid("uid");
  const perm = new PermissionSystem(realmId);
  const userPerm = await perm.canUserPerformAnyAction(suser._id, [
    permission_default.admin,
    permission_default.banUser
  ]);
  if (!userPerm)
    return validE2.err(codes_default.UserError.Socket.RealmEdit_NotAuthorized);
  await dataBase_default.realmUser.c(realmId).removeOne({ ban: uid });
  return { err: false };
}
async function realm_emojis_sync(suser, realmId) {
  const validE2 = new ValidError("realm.emojis.sync");
  if (!validData_default.id(realmId))
    return validE2.valid("realmId");
  const isUserInRealm = await checkIsUserOnRealm(suser._id, realmId);
  if (!isUserInRealm)
    return validE2.err(codes_default.UserError.Socket.UserNotOnRealm);
  const emojis = await dataBase_default.realmConf.c(realmId).find({
    $exists: { emoji: true }
  });
  return { err: false, res: [emojis] };
}
async function realm_announcement_channel_subscribe(suser, sourceRealmId, sourceChannelId, targetRealmId, targetChannelId) {
  const validE2 = new ValidError("realm.announcement.channel.subscribe");
  if (!validData_default.id(sourceRealmId))
    return validE2.valid("sourceRealmId");
  if (!validData_default.id(sourceChannelId))
    return validE2.valid("sourceChannelId");
  if (!validData_default.id(targetRealmId))
    return validE2.valid("targetRealmId");
  if (!validData_default.id(targetChannelId))
    return validE2.valid("targetChannelId");
  const permSys = new PermissionSystem(targetRealmId);
  const userPerm = await permSys.canUserPerformAction(suser._id, permission_default.admin);
  if (!userPerm)
    return validE2.err(codes_default.UserError.Socket.RealmEdit_NotAuthorized);
  const data = {
    sr: sourceRealmId,
    sc: sourceChannelId,
    tr: targetRealmId,
    tc: targetChannelId
  };
  const exists2 = await dataBase_default.realmData.c("announcement.channels").findOne(data);
  if (exists2)
    return validE2.err(codes_default.UserError.Socket.RealmAnnouncementSubscribe_AlreadySubscribed);
  await dataBase_default.realmData.c("announcement.channels").add(data, false);
  clearEventCache(targetRealmId);
  return { err: false };
}
async function realm_announcement_channel_unsubscribe(suser, sourceRealmId, sourceChannelId, targetRealmId, targetChannelId) {
  const validE2 = new ValidError("realm.announcement.channel.unsubscribe");
  if (!validData_default.id(sourceRealmId))
    return validE2.valid("sourceRealmId");
  if (!validData_default.id(sourceChannelId))
    return validE2.valid("sourceChannelId");
  if (!validData_default.id(targetRealmId))
    return validE2.valid("targetRealmId");
  if (!validData_default.id(targetChannelId))
    return validE2.valid("targetChannelId");
  const permSys = new PermissionSystem(targetRealmId);
  const userPerm = await permSys.canUserPerformAction(suser._id, permission_default.admin);
  if (!userPerm)
    return validE2.err(codes_default.UserError.Socket.RealmEdit_NotAuthorized);
  await dataBase_default.realmData.c("announcement.channels").removeOne({
    sr: sourceRealmId,
    sc: sourceChannelId,
    tr: targetRealmId,
    tc: targetChannelId
  });
  clearEventCache(targetRealmId);
  return { err: false };
}
async function realm_announcement_channel_available(suser) {
  const userRealms = await dataBase_default.userData.c(suser._id).find({ $exists: { realm: true } });
  const realmsWithAdmin = [];
  for (const userRealmId of userRealms) {
    const permSys = new PermissionSystem(userRealmId.realm);
    const userPerm = await permSys.canUserPerformAction(suser._id, permission_default.admin);
    if (userPerm)
      realmsWithAdmin.push(userRealmId.realm);
  }
  return { err: false, res: [realmsWithAdmin] };
}
async function realm_announcement_channel_list(suser, realmId) {
  const validE2 = new ValidError("realm.announcement.channel.list");
  if (!validData_default.id(realmId))
    return validE2.valid("realmId");
  const isUserInRealm = await checkIsUserOnRealm(suser._id, realmId);
  if (!isUserInRealm)
    return validE2.err(codes_default.UserError.Socket.UserNotOnRealm);
  const permSys = new PermissionSystem(realmId);
  const userPerm = await permSys.canUserPerformAction(suser._id, permission_default.admin);
  if (!userPerm)
    return validE2.err(codes_default.UserError.Socket.RealmEdit_NotAuthorized);
  const subscribedChannels = await dataBase_default.realmData.c("announcement.channels").find({ tr: realmId });
  const channels = await dataBase_default.realmConf.c(realmId).find({
    $exists: {
      chid: true
    },
    $in: {
      type: ["text", "announcement", "open_announcement"]
    }
  }, {}, {}, {
    select: ["chid", "name"]
  }).then((channels2) => {
    const availableChannels = [];
    for (const channel of channels2) {
      if (subscribedChannels.some((tc) => tc.sc == channel.chid))
        continue;
      if (subscribedChannels.some((tc) => tc.tc == channel.chid))
        continue;
      availableChannels.push(channel);
    }
    return availableChannels;
  });
  return { err: false, res: [channels] };
}
async function realm_thread_create(suser, realmId, channelId, name, replyMsgId = null) {
  const validE2 = new ValidError("realm.thread.create");
  if (!validData_default.id(realmId))
    return validE2.valid("realmId");
  if (!validData_default.id(channelId))
    return validE2.valid("channelId");
  if (!validData_default.str(name, 0, 30))
    return validE2.valid("name");
  if (replyMsgId && !validData_default.id(replyMsgId))
    return validE2.valid("replyMsgId");
  const chnlType = await dataBase_default.realmConf.c(realmId).findOne({
    chid: channelId
  });
  if (!chnlType)
    return validE2.valid("channelId");
  if (chnlType.type != "forum") {
    const perms = await getChnlPerm(suser._id, realmId, channelId);
    if (!perms.threadCreate)
      return validE2.err(codes_default.UserError.Socket.RealmEdit_NotAuthorized);
  }
  const threadObj = {
    thread: channelId,
    name,
    author: suser._id
  };
  if (replyMsgId)
    threadObj.reply = replyMsgId;
  const thread = await dataBase_default.realmData.c(realmId).add(threadObj, true);
  return { err: false, res: [thread._id] };
}
async function realm_thread_delete(suser, realmId, threadId) {
  const validE2 = new ValidError("realm.thread.delete");
  if (!validData_default.id(realmId))
    return validE2.valid("realmId");
  if (!validData_default.id(threadId))
    return validE2.valid("threadId");
  const perms = await getChnlPerm(suser._id, realmId, threadId);
  if (!perms.threadCreate)
    return validE2.err(codes_default.UserError.Socket.RealmEdit_NotAuthorized);
  const thread = await dataBase_default.realmData.c(realmId).findOne({ _id: threadId });
  if (!thread)
    return validE2.err(codes_default.UserError.Socket.ThreadDelete_NotFound);
  if (thread.author != suser._id) {
    const permSys = new PermissionSystem(realmId);
    const canAdmin = await permSys.canUserPerformAction(suser._id, permission_default.admin);
    if (!canAdmin)
      return validE2.err(codes_default.UserError.Socket.RealmEdit_NotAuthorized);
  }
  await dataBase_default.realmData.c(realmId).removeOne({ _id: threadId });
  await dataBase_default.mess.c(realmId).remove({ chnl: "&" + threadId });
  sendToRealmUsers(realmId, "realm.thread.delete", threadId);
  return { err: false };
}
async function realm_thread_list(suser, realmId, channelId) {
  const validE2 = new ValidError("realm.thread.list");
  if (!validData_default.id(realmId))
    return validE2.valid("realmId");
  if (!validData_default.id(channelId) && channelId != null)
    return validE2.valid("channelId");
  const isUserInRealm = await checkIsUserOnRealm(suser._id, realmId);
  if (!isUserInRealm)
    return validE2.err(codes_default.UserError.Socket.UserNotOnRealm);
  if (channelId === null) {
    const threads2 = await dataBase_default.realmData.c(realmId).find({
      $exists: { thread: true }
    });
    const chnlCache = {};
    const cpu_threads = threads2.map(async (t) => {
      async function getChnlType() {
        if (t.thread in chnlCache)
          return chnlCache[t.thread];
        const chnl = await dataBase_default.realmConf.c(realmId).findOne({
          chid: t.thread
        });
        chnlCache[t.thread] = chnl.type;
        return chnl.type;
      }
      const type = await getChnlType();
      if (type === "forum")
        return false;
      const perms2 = await getChnlPerm(suser._id, realmId, t.thread);
      return perms2.threadView ? t : false;
    });
    const threadsWithPerms = await Promise.all(cpu_threads);
    const filtered = threadsWithPerms.filter(Boolean);
    return { err: false, res: [filtered] };
  }
  const perms = await getChnlPerm(suser._id, realmId, channelId);
  if (!perms.threadView)
    return validE2.err(codes_default.UserError.Socket.RealmThreadList_NotAuthorized);
  const threads = await dataBase_default.realmData.c(realmId).find({ thread: channelId });
  return { err: false, res: [threads] };
}
async function realm_event_create(suser, realmId, req) {
  const validE2 = new ValidError("realm.event.create");
  if (!validData_default.id(realmId))
    return validE2.valid("realmId");
  if (!eventCreateSchema(req))
    return validE2.valid("req");
  if (req.type === "voice") {
    if (!validData_default.id(req.where))
      return validE2.valid("req.where");
    const chnl = await dataBase_default.realmConf.c(realmId).findOne({
      chid: req.where
    });
    if (!chnl)
      return validE2.valid("req.where");
    if (chnl.type !== "voice")
      return validE2.valid("req.where");
  }
  const actualTime = Date.now();
  if (req.time * 1000 <= actualTime + 60000)
    return validE2.valid("req.time");
  const permSys = new PermissionSystem(realmId);
  const canAdmin = await permSys.canUserPerformAction(suser._id, permission_default.admin);
  if (!canAdmin)
    return validE2.err(codes_default.UserError.Socket.RealmEdit_NotAuthorized);
  const data = {
    evt: true,
    type: req.type,
    where: req.where,
    time: req.time,
    author: suser._id,
    topic: req.topic
  };
  if (req.desc)
    data.desc = req.desc;
  if (req.img)
    data.img = req.img;
  const { _id } = await dataBase_default.realmData.c(realmId).add(data);
  const task = {
    type: "event",
    data: {
      realm: realmId,
      evt: _id
    },
    sTime: req.time,
    sType: "one-time"
  };
  addTask(task);
  return { err: false };
}
async function realm_event_delete(suser, realmId, eventId) {
  const validE2 = new ValidError("realm.event.delete");
  if (!validData_default.id(realmId))
    return validE2.valid("realmId");
  if (!validData_default.id(eventId))
    return validE2.valid("eventId");
  const permSys = new PermissionSystem(realmId);
  const canAdmin = await permSys.canUserPerformAction(suser._id, permission_default.admin);
  if (!canAdmin)
    return validE2.err(codes_default.UserError.Socket.RealmEdit_NotAuthorized);
  const taskId = await dataBase_default.system.c("tasks").findOne({
    type: "event",
    data: { evt: eventId }
  });
  if (taskId)
    await cancelTask(taskId._id);
  await dataBase_default.realmData.c(realmId).removeOne({ _id: eventId, evt: true });
  await dataBase_default.realmData.c(realmId).remove({ uevt: eventId });
  return { err: false };
}
async function realm_event_list(suser, realmId, len = false) {
  const validE2 = new ValidError("realm.event.list");
  if (!validData_default.id(realmId))
    return validE2.valid("realmId");
  const isUserInRealm = await checkIsUserOnRealm(suser._id, realmId);
  if (!isUserInRealm)
    return validE2.err(codes_default.UserError.Socket.UserNotOnRealm);
  const events = await dataBase_default.realmData.c(realmId).find({
    evt: true
  });
  if (len)
    return { err: false, res: [events.length] };
  const eventsUsers = await dataBase_default.realmData.c(realmId).find({ $exists: { uevt: true } });
  const data = [];
  for (const event of events) {
    const users = eventsUsers.filter((ev) => ev.uevt === event._id);
    data.push({
      ...event,
      users: users.map((ev) => ev.u)
    });
  }
  return { err: false, res: [data] };
}
async function realm_event_join(suser, realmId, eventId) {
  const validE2 = new ValidError("realm.event.join");
  if (!validData_default.id(realmId))
    return validE2.valid("realmId");
  if (!validData_default.id(eventId))
    return validE2.valid("eventId");
  const isUserInRealm = await checkIsUserOnRealm(suser._id, realmId);
  if (!isUserInRealm)
    return validE2.err(codes_default.UserError.Socket.UserNotOnRealm);
  const joined = await dataBase_default.realmData.c(realmId).findOne({
    u: suser._id,
    uevt: eventId
  });
  if (joined)
    return validE2.err(codes_default.UserError.Socket.RealmEventJoin_AlreadyJoined);
  await dataBase_default.realmData.c(realmId).add({ u: suser._id, uevt: eventId });
  return { err: false };
}
async function realm_event_leave(suser, realmId, eventId) {
  const validE2 = new ValidError("realm.event.leave");
  if (!validData_default.id(realmId))
    return validE2.valid("realmId");
  if (!validData_default.id(eventId))
    return validE2.valid("eventId");
  const isUserInRealm = await checkIsUserOnRealm(suser._id, realmId);
  if (!isUserInRealm)
    return validE2.err(codes_default.UserError.Socket.UserNotOnRealm);
  await dataBase_default.realmData.c(realmId).removeOne({ u: suser._id, uevt: eventId });
  return { err: false };
}
async function realm_event_get_topic(suser, realmId, eventId) {
  const validE2 = new ValidError("realm.event.get.topic");
  if (!validData_default.id(realmId))
    return validE2.valid("realmId");
  if (!validData_default.id(eventId))
    return validE2.valid("eventId");
  const isUserInRealm = await checkIsUserOnRealm(suser._id, realmId);
  if (!isUserInRealm)
    return validE2.err(codes_default.UserError.Socket.UserNotOnRealm);
  const event = await dataBase_default.realmData.c(realmId).findOne({
    _id: eventId,
    evt: true
  });
  if (!event)
    return validE2.err(codes_default.UserError.Socket.RealmEventGetTopic_NotFound);
  return { err: false, res: [event.topic] };
}
async function realm_user_role_remove(suser, realmId, uid, roleIdOrLvl) {
  const validE2 = new ValidError("realm.user.role.remove");
  if (!validData_default.id(realmId))
    return validE2.valid("realmId");
  if (!validData_default.id(uid))
    return validE2.valid("uid");
  if (!validData_default.id(roleIdOrLvl) && !validData_default.num(roleIdOrLvl))
    return validE2.valid("roleId");
  const permSys = new PermissionSystem(realmId);
  const userPerm = await permSys.canUserPerformAction(suser._id, permission_default.manageRoles);
  if (!userPerm)
    return validE2.err(codes_default.UserError.Socket.RealmEdit_NotAuthorized);
  const roleId = typeof roleIdOrLvl === "number" ? (await permSys.getAllRolesSorted())[roleIdOrLvl]?._id : roleIdOrLvl;
  if (!roleId)
    return validE2.err(codes_default.UserError.Socket.RealmEdit_NotAuthorized);
  try {
    await permSys.removeRoleFromUser(uid, roleId, suser._id);
    sendToRealmUsers(realmId, "refreshData", "realm.users.sync", realmId);
  } catch {
    return validE2.err(codes_default.UserError.Socket.RealmEdit_NotAuthorized);
  }
  return { err: false };
}
async function realm_user_role_add(suser, realmId, uid, roleIdOrLvl) {
  const validE2 = new ValidError("realm.user.role.add");
  if (!validData_default.id(realmId))
    return validE2.valid("realmId");
  if (!validData_default.id(uid))
    return validE2.valid("uid");
  if (!validData_default.id(roleIdOrLvl) && !validData_default.num(roleIdOrLvl))
    return validE2.valid("roleId");
  const permSys = new PermissionSystem(realmId);
  const userPerm = await permSys.canUserPerformAction(suser._id, permission_default.manageRoles);
  if (!userPerm)
    return validE2.err(codes_default.UserError.Socket.RealmEdit_NotAuthorized);
  const roleId = typeof roleIdOrLvl === "number" ? (await permSys.getAllRolesSorted())[roleIdOrLvl]?._id : roleIdOrLvl;
  if (!roleId)
    return validE2.err(codes_default.UserError.Socket.RealmEdit_NotAuthorized);
  try {
    await permSys.assignRoleToUser(uid, roleId, suser._id);
    sendToRealmUsers(realmId, "refreshData", "realm.users.sync", realmId);
  } catch {
    return validE2.err(codes_default.UserError.Socket.RealmEdit_NotAuthorized);
  }
  return { err: false };
}
var eventCreateSchema;
var init_realms = __esm(async () => {
  init_codes();
  init_permission();
  init_validData();
  init_server();
  init_event();
  await __promiseAll([
    init_dataBase(),
    init_checkIsUserOnRealm(),
    init_chnlPermissionCache(),
    init_permission_system(),
    init_announcementChnl(),
    init_status(),
    init_schedule(),
    init_socket()
  ]);
  eventCreateSchema = validData_default.objAjv(event_default);
});

// back/socket/chat/logic/mess.ts
async function message_edit(suser, chatId, _id, msg, options = {}) {
  options = {
    minMsg: 0,
    maxMsg: 2000,
    ...options
  };
  const validE2 = new ValidError("message.edit");
  if (!validData_default.id(chatId))
    return validE2.valid("chatId");
  if (!validData_default.id(_id))
    return validE2.valid("_id");
  if (!validData_default.str(msg, options.minMsg, options.maxMsg))
    return validE2.valid("msg");
  const isDmChat = chatId.startsWith("$");
  const dbChatId = isDmChat ? combineId(suser._id, chatId.replace("$", "")) : chatId;
  const mess = await dataBase_default.mess.c(dbChatId).findOne({ _id });
  if (!mess) {
    return validE2.err(codes_default.UserError.Socket.MessageEdit_MessageNotFound);
  }
  if (mess.fr !== suser._id) {
    return validE2.err(codes_default.UserError.Socket.MessageEdit_NotAuthorized);
  }
  const time = Math.floor(new Date().getTime() / 1000).toString(36);
  await dataBase_default.mess.c(dbChatId).updateOne({ _id }, { msg, lastEdit: time });
  if (isDmChat) {
    sendToUser(suser._id, "message.edit", _id, msg, time, chatId);
    sendToUser(chatId.replace("$", ""), "message.edit", _id, msg, time, "$" + suser._id);
  } else {
    sendToRealmUsers(dbChatId, "message.edit", _id, msg, time, dbChatId);
  }
  return { err: false };
}
async function message_delete(suser, chatId, _id) {
  const validE2 = new ValidError("message.delete");
  if (!validData_default.id(chatId))
    return validE2.valid("chatId");
  if (!validData_default.id(_id))
    return validE2.valid("_id");
  const isDmChat = chatId.startsWith("$");
  const dbChatId = isDmChat ? combineId(suser._id, chatId.replace("$", "")) : chatId;
  const mess = await dataBase_default.mess.c(dbChatId).findOne({ _id });
  if (!mess) {
    return validE2.err(codes_default.UserError.Socket.MessageDelete_MessageNotFound);
  }
  if (mess.fr !== suser._id) {
    const permSys = new PermissionSystem(dbChatId);
    const userPerm = await permSys.canUserPerformAction(suser._id, permission_default.manageMessages);
    if (!userPerm)
      return validE2.err(codes_default.UserError.Socket.MessageDelete_NotAuthorized);
  }
  await dataBase_default.mess.c(dbChatId).removeOne({ _id });
  if (isDmChat) {
    sendToUser(suser._id, "message.delete", _id, chatId);
    sendToUser(chatId.replace("$", ""), "message.delete", _id, "$" + suser._id);
  } else {
    sendToRealmUsers(dbChatId, "message.delete", _id, dbChatId);
    const threads = await dataBase_default.realmData.c(dbChatId).find({
      reply: _id
    });
    for (const thread of threads) {
      await realm_thread_delete(suser, dbChatId, thread._id);
    }
  }
  return { err: false };
}
async function messages_delete(suser, chatId, ids) {
  const validE2 = new ValidError("messages.delete");
  if (!validData_default.id(chatId))
    return validE2.valid("chatId");
  if (!validData_default.arrayId(ids))
    return validE2.valid("ids");
  const isDmChat = chatId.startsWith("$");
  const dbChatId = isDmChat ? combineId(suser._id, chatId.replace("$", "")) : chatId;
  const messages = await dataBase_default.mess.c(dbChatId).find({ $in: { _id: ids } });
  if (messages.some((mess) => mess.fr !== suser._id)) {
    if (isDmChat)
      return validE2.err(codes_default.UserError.Socket.MessagesDelete_NotAuthorized);
    const permSys = new PermissionSystem(dbChatId);
    const userPerm = await permSys.canUserPerformAction(suser._id, permission_default.manageMessages);
    if (!userPerm)
      return validE2.err(codes_default.UserError.Socket.MessagesDelete_NotAuthorized);
  }
  if (!isDmChat) {
    for (const mess of messages) {
      const threads = await dataBase_default.realmData.c(dbChatId).find({
        reply: mess._id
      });
      for (const thread of threads) {
        await realm_thread_delete(suser, dbChatId, thread._id);
      }
    }
  }
  await dataBase_default.mess.c(dbChatId).remove({ $in: { _id: ids } });
  if (isDmChat) {
    sendToUser(suser._id, "messages.delete", ids, chatId);
    sendToUser(chatId.replace("$", ""), "messages.delete", ids, "$" + suser._id);
  } else {
    sendToRealmUsers(dbChatId, "messages.delete", ids, dbChatId);
    const threads = await dataBase_default.realmData.c(dbChatId).find({ $in: { reply: ids } });
    for (const thread of threads) {
      await realm_thread_delete(suser, dbChatId, thread._id);
    }
  }
  return { err: false };
}
async function message_fetch(suser, chatId, chnl, start, end) {
  const validE2 = new ValidError("message.fetch");
  if (!validData_default.id(chatId))
    return validE2.valid("chatId");
  if (!validChannelId(chnl))
    return validE2.valid("chnl");
  if (!validData_default.num(start, 0))
    return validE2.valid("start");
  if (!validData_default.num(end, 0))
    return validE2.valid("end");
  const isDmChat = chatId.startsWith("$");
  const dbChatId = isDmChat ? combineId(suser._id, chatId.replace("$", "")) : chatId;
  if (!isDmChat) {
    const perm = await getChnlPerm(suser._id, dbChatId, chnl);
    if (!perm.view)
      return validE2.err(codes_default.UserError.Socket.MessageFetch_ChannelNotFound);
  }
  const responeAll = await dataBase_default.mess.c(dbChatId).find({ chnl }, { reverse: true, limit: end + start });
  const res = responeAll.slice(start, end);
  return { err: false, res: [res] };
}
async function message_fetch_id(suser, chatId, chnl, mess_id) {
  const validE2 = new ValidError("message.fetch.id");
  if (!validData_default.id(chatId))
    return validE2.valid("chatId");
  if (!validData_default.id(mess_id))
    return validE2.valid("mess_id");
  if (!validChannelId(chnl))
    return validE2.valid("chnl");
  const isDmChat = chatId.startsWith("$");
  const dbChatId = isDmChat ? combineId(suser._id, chatId.replace("$", "")) : chatId;
  if (!isDmChat) {
    const perm = await getChnlPerm(suser._id, dbChatId, chnl);
    if (!perm.view)
      return validE2.err(codes_default.UserError.Socket.MessageFetchId_ChannelNotFound);
  }
  const res = await dataBase_default.mess.c(dbChatId).findOne({ _id: mess_id });
  return { err: false, res: [res] };
}
async function message_mark_read(suser, chatId, chnl, mess_id) {
  const validE2 = new ValidError("message.mark.read");
  if (!validData_default.id(chatId))
    return validE2.valid("to");
  if (!validChannelId(chnl))
    return validE2.valid("chnl");
  if (!validData_default.idOrSpecificStr(mess_id, ["last"]))
    return validE2.valid("mess_id");
  const isDmChat = chatId.startsWith("$");
  const search = {};
  if (isDmChat)
    search.priv = chatId.replace("$", "");
  else
    search.realm = chatId;
  let res = undefined;
  if (mess_id == "last") {
    const dbChatId = isDmChat ? combineId(suser._id, chatId.replace("$", "")) : chatId;
    const lastIdMess = await dataBase_default.mess.c(dbChatId).find({ chnl }, { reverse: true, limit: 1 });
    if (lastIdMess.length == 0)
      return { err: false, res: [0] };
    mess_id = lastIdMess[0]._id;
    res = mess_id;
  }
  await dataBase_default.userData.c(suser._id).updateOne(search, {
    $merge: {
      last: {
        [chnl]: mess_id
      }
    }
  });
  return { err: false, res: [res] };
}
async function message_react(suser, chatId, msgId, react) {
  const validE2 = new ValidError("message.react");
  if (!validData_default.id(chatId))
    return validE2.valid("chatId");
  if (!validData_default.id(msgId))
    return validE2.valid("msgId");
  if (!validData_default.str(react, 0, 30))
    return validE2.valid("react");
  const isDmChat = chatId.startsWith("$");
  const dbChatId = isDmChat ? combineId(suser._id, chatId.replace("$", "")) : chatId;
  const msg = await dataBase_default.mess.c(dbChatId).findOne({
    _id: msgId
  });
  if (!msg)
    return validE2.err(codes_default.UserError.Socket.MessageReact_MessageNotFound);
  const chnl = msg.chnl;
  const perm = await getChnlPerm(suser._id, dbChatId, chnl);
  if (!perm.react)
    return validE2.err(codes_default.UserError.Socket.MessageReact_NotAuthorized);
  const reacts = msg.reacts || {};
  if (!reacts[react])
    reacts[react] = [];
  if (reacts[react].includes(suser._id)) {
    reacts[react] = reacts[react].filter((id) => id != suser._id);
    if (reacts[react].length == 0)
      delete reacts[react];
  } else {
    reacts[react].push(suser._id);
  }
  await dataBase_default.mess.c(dbChatId).updateOne({ _id: msgId }, { reacts });
  if (chatId.startsWith("$")) {
    sendToUser(suser._id, "message.react", suser._id, chatId, msgId, react);
    sendToUser(chatId.replace("$", ""), "message.react", suser._id, "$" + suser._id, msgId, react);
  } else {
    sendToRealmUsers(chatId, "message.react", suser._id, chatId, msgId, react);
  }
  return { err: false };
}
async function message_search(suser, chatId, chnl, query) {
  const validE2 = new ValidError("message.search");
  if (!validData_default.id(chatId))
    return validE2.valid("realm");
  if (!validChannelId(chnl))
    return validE2.valid("chnl");
  if (!messageSearchSchemat(query))
    return validE2.valid("search", messageSearchSchemat.errors);
  const isDmChat = chatId.startsWith("$");
  const dbChatId = isDmChat ? combineId(suser._id, chatId.replace("$", "")) : chatId;
  const res = await dataBase_default.mess.c(dbChatId).find((data, context) => {
    if (data.chnl != chnl)
      return false;
    return context.filterMessages(context.query, data);
  }, {}, {}, { query, filterMessages });
  return { err: false, res: [res] };
}
async function message_pin(suser, chatId, chnl, msg_id, pin) {
  const validE2 = new ValidError("message.pin");
  if (!validData_default.id(chatId))
    return validE2.valid("realm");
  if (!validChannelId(chnl))
    return validE2.valid("chnl");
  if (!validData_default.id(msg_id))
    return validE2.valid("msgId");
  if (!validData_default.bool(pin))
    return validE2.valid("pin");
  const isDmChat = chatId.startsWith("$");
  const dbChatId = isDmChat ? combineId(suser._id, chatId.replace("$", "")) : chatId;
  await dataBase_default.mess.c(dbChatId).updateOne({ _id: msg_id }, { pinned: pin });
  const refreshData = {
    evt: "message.fetch.pinned",
    realm: chatId,
    chnl
  };
  if (isDmChat) {
    sendToUser(suser._id, "refreshData", refreshData, chatId, chnl);
    refreshData.realm = "$" + suser._id;
    sendToUser(chatId.replace("$", ""), "refreshData", refreshData, "$" + suser._id, chnl);
  } else {
    sendToRealmUsers(chatId, "refreshData", refreshData, chatId, chnl);
  }
  return { err: false };
}
async function message_fetch_pinned(suser, chatId, chnl) {
  const validE2 = new ValidError("message.get.pinned");
  if (!validData_default.id(chatId))
    return validE2.valid("realm");
  if (!validChannelId(chnl))
    return validE2.valid("chnl");
  const isDmChat = chatId.startsWith("$");
  const dbChatId = isDmChat ? combineId(suser._id, chatId.replace("$", "")) : chatId;
  const res = await dataBase_default.mess.c(dbChatId).find({ chnl, pinned: true });
  return { err: false, res: [res] };
}
function filterMessages(query, mess) {
  const time = extractTimeFromId(mess._id);
  if (query.from && mess.fr !== query.from)
    return false;
  if (query.mentions && !mess.msg.includes(`@${query.mentions}`))
    return false;
  if (query.before && time >= new Date(query.before).getTime())
    return false;
  if (query.during) {
    const startOfDay = new Date(query.during).setHours(0, 0, 0, 0);
    const endOfDay = new Date(query.during).setHours(23, 59, 59, 999);
    if (time < startOfDay || time > endOfDay)
      return false;
  }
  if (query.after && time <= new Date(query.after).getTime())
    return false;
  if (query.pinned !== undefined && query.pinned !== (mess.pinned === true))
    return false;
  if (query.message && !mess.msg.includes(query.message))
    return false;
  return true;
}
var messageSearchSchemat;
var init_mess = __esm(async () => {
  init_codes();
  init_permission();
  init_validData();
  init_messageSearch();
  await __promiseAll([
    init_dataBase(),
    init_chatMgmt(),
    init_chnlPermissionCache(),
    init_permission_system(),
    init_realms(),
    init_socket()
  ]);
  messageSearchSchemat = validData_default.objAjv(messageSearch_default);
});

// back/logic/mobileNotif.ts
import { randomBytes } from "crypto";
import { genId as genId2 } from "@wxn0brp/db";
import { AnotherCache as AnotherCache7 } from "@wxn0brp/ac";
async function createTokenPointer(userId, token) {
  const random = randomBytes(32).toString("hex");
  const id = genId2();
  const pointer = await create({ id, random, user: userId }, "2m", 1 /* TEMPORARY */);
  cache4.set(id, token);
  return pointer;
}
async function getTokenFromPointer(pointerToken) {
  const data = await decode(pointerToken, 1 /* TEMPORARY */);
  if (!data)
    return null;
  const userToken = cache4.get(data.id);
  if (!userToken)
    return null;
  const userTokenData = await decode(userToken, 2 /* USER_TOKEN */);
  if (!userTokenData)
    return null;
  return {
    user: data.user,
    token: userToken,
    exp: userTokenData.exp
  };
}
var cache4;
var init_mobileNotif = __esm(async () => {
  await init_token();
  cache4 = new AnotherCache7({
    ttl: 2 * 60,
    cleanupInterval: 15 * 60
  });
});

// back/logic/ogToEmbed.ts
import ogs from "open-graph-scraper";
function processOgsToEmbed(data, link) {
  const title = data.ogTitle || data.twitterTitle || data.title || "No title";
  const description = data.ogDescription || data.twitterDescription || data.description || "No description";
  const image = data.ogImage && data.ogImage[0] && data.ogImage[0].url || data.twitterImage || data.favicon || null;
  const url = data.ogUrl || data.requestUrl || link;
  const embed = {
    title,
    description,
    image,
    url,
    customFields: {
      Type: data.ogType || "Unknown",
      Source: link,
      "Image Available": image ? "Yes" : "No",
      Domain: new URL(link).hostname
    }
  };
  if (data.ogSiteName) {
    embed.customFields["Page"] = data.ogSiteName;
  }
  if (data.article && data.article.published_time) {
    embed.customFields["Release Date"] = new Date(data.article.published_time).toLocaleDateString();
  }
  return embed;
}
async function ogsToEmbed(link) {
  const data = await ogs({ url: link });
  if (data.error)
    return null;
  return processOgsToEmbed(data.result, link);
}
var ogToEmbed_default;
var init_ogToEmbed = __esm(() => {
  ogToEmbed_default = ogsToEmbed;
});

// back/socket/chat/valid/embedData.ts
var embedData_default;
var init_embedData = __esm(() => {
  embedData_default = {
    type: "object",
    properties: {
      title: { type: "string" },
      url: { type: "string" },
      description: { type: "string" },
      image: { type: "string" },
      customFields: {
        type: "object",
        additionalProperties: { type: "string" }
      }
    },
    required: ["title"],
    additionalProperties: false
  };
});

// back/socket/chat/valid/status.ts
var status_default;
var init_status2 = __esm(() => {
  status_default = {
    type: "object",
    properties: {
      state: { type: "string", minLength: 1, maxLength: 256 },
      name: { type: "string", minLength: 1, maxLength: 256 },
      details: { type: "string", minLength: 1, maxLength: 256 },
      logoName: { type: "string", minLength: 1, maxLength: 256 },
      logoText: { type: "string", minLength: 1, maxLength: 256 },
      startTime: { type: "number", minimum: 0 },
      endTime: { type: "number", minimum: 0 },
      party: {
        type: "object",
        properties: {
          id: { type: "string", minLength: 1, maxLength: 256 },
          state: { type: "number", minimum: 0 },
          max: { type: "number", minimum: 0 }
        },
        required: ["id", "state"]
      }
    },
    required: ["state", "name"],
    additionalProperties: false
  };
});

// back/socket/chat/logic/other.ts
import { genId as genId3 } from "@wxn0brp/db";
import ogs2 from "open-graph-scraper";
async function get_ogs(suser, link) {
  const validE2 = new ValidError("get.ogs");
  if (!validData_default.str(link, 0, 300))
    return validE2.valid("link");
  if (!/^https?:\/\//.test(link))
    return validE2.valid("link");
  const { error, result } = await ogs2({ url: link });
  if (error)
    return validE2.err(error);
  return { err: false, res: [result] };
}
async function send_embed_og(suser, to, chnl, link) {
  const validE2 = new ValidError("send.embed.og");
  if (!validData_default.id(to))
    return validE2.valid("to");
  if (!validChannelId(chnl))
    return validE2.valid("chnl");
  if (!validData_default.str(link, 0, 300))
    return validE2.valid("link");
  if (!/^https?:\/\//.test(link))
    return validE2.valid("link");
  const embed = await ogToEmbed_default(link);
  if (!embed)
    return validE2.err(codes_default.ServerError.Socket.OgEmbed_ErrorFetching);
  const result = await sendMessage({
    to,
    chnl,
    msg: "Embed"
  }, suser, {
    customFields: {
      embed
    }
  });
  if (result.err)
    return validE2.err(result.err);
  return { err: false };
}
async function send_embed_data(suser, to, chnl, embed) {
  const validE2 = new ValidError("send.embed.data");
  if (!validData_default.id(to))
    return validE2.valid("to");
  if (!validChannelId(chnl))
    return validE2.valid("chnl");
  if (!embedDataSchemat(embed))
    return validE2.valid("embed", embedDataSchemat.errors);
  const result = await sendMessage({
    to,
    chnl,
    msg: "Embed"
  }, suser, {
    customFields: {
      embed
    }
  });
  if (result.err)
    return validE2.err(result.err);
  return { err: false };
}
async function fireToken_get(suser, userToken) {
  const pointer = await createTokenPointer(suser._id, userToken);
  return { err: false, res: [pointer] };
}
async function status_activity_set(suser, status) {
  const validE2 = new ValidError("status.activity.set");
  if (!statusDataSchemat(status))
    return validE2.valid("status", statusDataSchemat.errors);
  const endCode = setCache(suser._id, status);
  if (endCode)
    return validE2.err(endCode);
  return { err: false };
}
async function status_activity_get(suser, id) {
  const validE2 = new ValidError("status.activity.get");
  if (!validData_default.id(id))
    return validE2.valid("id");
  const status = getCache(id);
  return { err: false, res: [status] };
}
async function status_activity_gets(suser, ids) {
  const validE2 = new ValidError("status.activity.gets");
  if (!validData_default.arrayId(ids))
    return validE2.valid("ids");
  const states = ids.map((id) => getCache(id));
  return { err: false, res: [states] };
}
async function status_activity_remove(suser) {
  rmCache(suser._id);
  return { err: false };
}
async function user_delete(suser) {
  const domain = process.env.DOMAIN || "https://fusion.ct8.pl";
  const id = genId3();
  const token = await create({
    _id: id,
    user: suser._id
  }, "1d", 0 /* GENERAL */);
  const confirmLink = `${domain}/rm/account-confirm?token=${token}`;
  const cancelLink = `${domain}/rm/account-undo?token=${token}`;
  mail_default("confirmDeleteAccount", suser.email, suser.name, confirmLink, cancelLink);
  return { err: false };
}
var embedDataSchemat, statusDataSchemat;
var init_other = __esm(async () => {
  init_codes();
  init_mail();
  init_ogToEmbed();
  init_validData();
  init_embedData();
  init_status2();
  await __promiseAll([
    init_mobileNotif(),
    init_sendMessage(),
    init_status(),
    init_token()
  ]);
  embedDataSchemat = validData_default.objAjv(embedData_default);
  statusDataSchemat = validData_default.objAjv(status_default);
});

// back/socket/chat/logic/helpers/emitUserStatusUpdate.ts
async function emitUserStatusUpdate(id, status, text) {
  const relation_users = new Map;
  const friends = await dataBase_default.dataGraph.c("friends").find({ $or: [{ a: id }, { b: id }] });
  for (const f of friends) {
    relation_users.set(f.a, true);
    relation_users.set(f.b, true);
  }
  const realms = await dataBase_default.userData.c(id).find({ $exists: { realm: true } }, {}, { select: ["realm"] });
  for (const realm of realms) {
    const users2 = await dataBase_default.realmUser.c(realm.realm).find({ $exists: { u: true } }, {}, { select: ["u"] });
    for (const user of users2) {
      relation_users.set(user.u, true);
    }
  }
  const users = Array.from(relation_users.keys());
  for (const user of users) {
    sendToUser(user, "user.status.update", id, status, text);
  }
}
var emitUserStatusUpdate_default;
var init_emitUserStatusUpdate = __esm(async () => {
  await __promiseAll([
    init_imports(),
    init_socket()
  ]);
  emitUserStatusUpdate_default = emitUserStatusUpdate;
});

// back/socket/chat/logic/settings.ts
async function self_status_update(suser, status, text) {
  const validE2 = new ValidError("self.status.update");
  if (status && !validData_default.str(status, 0, 15))
    return validE2.valid("status", "status");
  if (text && !validData_default.str(text, 0, 150))
    return validE2.valid("text");
  if (!status)
    status = "online";
  if (!text)
    text = "";
  await dataBase_default.userData.c(suser._id).updateOneOrAdd({ _id: "status" }, { status, text });
  emitUserStatusUpdate_default(suser._id, status, text);
  return { err: false };
}
async function self_status_get(suser) {
  const status = await dataBase_default.userData.c(suser._id).findOne({
    _id: "status"
  });
  const activity = await getCache(suser._id);
  if (!status)
    return { err: false, res: ["online", "", activity] };
  return { err: false, res: [status.status, status.text, activity] };
}
async function profile_set_nickname(suser, nickname) {
  const validE2 = new ValidError("profile.set_nickname");
  if (!validData_default.str(nickname, 0, 30))
    return validE2.valid("nickname");
  const updated = await dataBase_default.userData.c(suser._id).updateOne({
    $exists: {
      nick: true
    }
  }, { nick: nickname });
  if (!updated)
    await dataBase_default.userData.c(suser._id).add({ nick: nickname }, false);
  return { err: false };
}
var init_settings = __esm(async () => {
  init_validData();
  await __promiseAll([
    init_dataBase(),
    init_status(),
    init_emitUserStatusUpdate()
  ]);
});

// back/socket/chat/register.ts
var generalEvents, userEvents, register_default = (socket) => {
  const engine = new engine_default(socket);
  for (const event of generalEvents) {
    engine.add(event[0], event[1], event[2], event[3]);
  }
  for (const event of userEvents) {
    engine.add(event[0], event[1], event[2], event[3]);
  }
};
var init_register = __esm(async () => {
  init_engine();
  await __promiseAll([
    init_chats(),
    init_friends(),
    init_sendMessage(),
    init_mess(),
    init_other(),
    init_realms(),
    init_settings()
  ]);
  generalEvents = [
    ["user.profile", 1000, true, user_profile],
    ["message.delete", 1000, false, message_delete],
    ["messages.delete", 1000, false, messages_delete],
    ["message.fetch", 300, true, message_fetch],
    ["message.fetch.id", 300, true, message_fetch_id],
    ["message.react", 100, false, message_react],
    ["message.search", 1000, true, message_search],
    ["message.pin", 1000, false, message_pin],
    ["message.fetch.pinned", 1000, true, message_fetch_pinned],
    ["get.ogs", 1000, true, get_ogs],
    ["send.embed.og", 1000, false, send_embed_og],
    ["send.embed.data", 1000, false, send_embed_data],
    ["realm.setup", 100, true, realm_setup],
    ["realm.users.sync", 1000, true, realm_users_sync],
    ["realm.users.activity.sync", 1000, true, realm_users_activity_sync],
    ["realm.user.kick", 1000, false, realm_user_kick],
    ["realm.user.unban", 1000, false, realm_user_unban],
    ["realm.emojis.sync", 1000, true, realm_emojis_sync],
    [
      "realm.announcement.channel.list",
      5000,
      true,
      realm_announcement_channel_list
    ],
    ["realm.thread.create", 1000, true, realm_thread_create],
    ["realm.thread.delete", 1000, false, realm_thread_delete],
    ["realm.thread.list", 1000, true, realm_thread_list],
    ["realm.event.create", 1000, false, realm_event_create],
    ["realm.event.delete", 1000, false, realm_event_delete],
    ["realm.event.list", 1000, true, realm_event_list],
    ["realm.event.get.topic", 1000, true, realm_event_get_topic],
    ["realm.user.role.remove", 1000, false, realm_user_role_remove],
    ["realm.user.role.add", 1000, false, realm_user_role_add]
  ];
  userEvents = [
    ["realm.get", 100, true, realm_get],
    ["dm.get", 100, true, dm_get],
    ["realm.create", 1000, true, realm_create],
    ["realm.exit", 1000, false, realm_exit],
    ["dm.create", 1000, true, dm_create],
    ["realm.join", 1000, false, realm_join],
    ["realm.mute", 1000, false, realm_mute],
    ["dm.block", 1000, false, dm_block],
    ["friend.request", 1000, false, friend_request],
    ["friend.response", 1000, false, friend_response],
    ["friend.request.remove", 1000, false, friend_request_remove],
    ["friend.remove", 1000, false, friend_remove],
    ["friend.get.all", 1000, true, friend_get_all],
    ["friend.requests.get", 1000, true, friend_requests_get],
    [
      "mess",
      200,
      false,
      async (suser, req) => {
        return await sendMessage(req, suser);
      }
    ],
    ["message.edit", 1000, false, message_edit],
    ["message.mark.read", 100, true, message_mark_read],
    ["fireToken.get", 1000, true, fireToken_get],
    ["status.activity.set", 1000, false, status_activity_set],
    ["status.activity.get", 1000, true, status_activity_get],
    ["status.activity.gets", 1000, true, status_activity_gets],
    ["status.activity.remove", 1000, false, status_activity_remove],
    ["user.delete", 50000, false, user_delete],
    ["realm.delete", 1e4, false, realm_delete],
    [
      "realm.announcement.channel.subscribe",
      1000,
      false,
      realm_announcement_channel_subscribe
    ],
    [
      "realm.announcement.channel.unsubscribe",
      1000,
      false,
      realm_announcement_channel_unsubscribe
    ],
    [
      "realm.announcement.channel.available",
      5000,
      true,
      realm_announcement_channel_available
    ],
    ["realm.event.join", 1000, false, realm_event_join],
    ["realm.event.leave", 1000, false, realm_event_leave],
    ["self.status.update", 1000, false, self_status_update],
    ["self.status.get", 100, true, self_status_get],
    ["profile.set_nickname", 100, false, profile_set_nickname]
  ];
});

// back/socket/bot/logic/bot.ts
async function get_bot_info(suser) {
  const data = {
    _id: suser._id,
    name: suser.name
  };
  return { err: false, res: [data] };
}

// back/socket/bot/register.ts
var botEvents, register_default2 = (socket) => {
  const engine = new engine_default(socket);
  for (const event of generalEvents) {
    engine.add(event[0], event[1], event[2], event[3]);
  }
  for (const event of botEvents) {
    engine.add(event[0], event[1], event[2], event[3]);
  }
};
var init_register2 = __esm(async () => {
  init_engine();
  await __promiseAll([
    init_register(),
    init_sendMessage()
  ]);
  botEvents = [
    ["get.bot.info", 1000, true, get_bot_info],
    [
      "mess",
      200,
      false,
      async (suser, req) => {
        return await sendMessage(req, suser, {
          frPrefix: "^"
        });
      }
    ]
  ];
});

// back/socket/bot/index.ts
var init_bot = __esm(async () => {
  init_limiter();
  init_server();
  await __promiseAll([
    init_dataBase(),
    init_token(),
    init_register2()
  ]);
  io.of("/bot").auth(async ({ headers }) => {
    const token = headers.auth;
    if (!token)
      return {
        status: 401,
        msg: "Unauthorized"
      };
    const tokenData = await decode(token, 3 /* BOT_TOKEN */);
    const _id = tokenData._id;
    const isValid = await dataBase_default.botData.c(_id).findOne({ token });
    if (!isValid)
      return {
        status: 401,
        msg: "Unauthorized"
      };
    const userName = await dataBase_default.botData.c(_id).findOne({ _id: "name" }).then((d) => d.name);
    const user = {
      _id,
      name: userName,
      email: undefined
    };
    if (bannedUsers.has(user._id)) {
      const userTime = bannedUsers.get(user._id);
      const remainingTime = userTime - Date.now();
      if (remainingTime > 0) {
        const time = Math.ceil(remainingTime / 1000 / 60) + 1;
        return {
          status: 403,
          msg: `Ban: You are temporarily banned. Please try again after ${time} minutes.`
        };
      } else {
        bannedUsers.delete(user._id);
      }
    }
    return {
      status: 200,
      user
    };
  });
  io.of("/bot").onConnect((socket) => {
    socket.logError = (e) => {
      lo("Error: ", e);
      dataBase_default.logs.c("gl").add({
        error: e.message,
        stackTrace: e.stack
      });
    };
    socket.processSocketError = (res, cb) => {
      const err = res.err;
      if (!Array.isArray(err))
        return false;
      const [event, ...args] = err;
      if (cb)
        cb(...args);
      else
        socket.emit(event, ...args);
      return true;
    };
    const limiter = new limiter_default(socket);
    socket.onLimit = limiter.onLimit.bind(limiter);
    register_default2(socket);
  });
});

// back/logic/auth.ts
async function authUser(token, tokenDecoded = { data: null }) {
  try {
    const data = await decode(token, 2 /* USER_TOKEN */);
    if (!data)
      return false;
    tokenDecoded.data = data;
    const { id } = data;
    if (!id)
      return false;
    const tokenD = await dataBase_default.data.c("token").findOne({ token });
    if (!tokenD)
      return false;
    const user = await dataBase_default.data.c("user").findOne({ _id: id }, {}, {
      select: ["_id", "name", "email"]
    });
    if (!user)
      return false;
    return user;
  } catch {
    return false;
  }
}
async function createUser(user) {
  const pay = {
    id: user._id
  };
  return await create(pay, "30d", 2 /* USER_TOKEN */);
}
var init_auth = __esm(async () => {
  await __promiseAll([
    init_dataBase(),
    init_token()
  ]);
});

// back/socket/chat/evt.ts
import { rm } from "fs";
async function updateFriendList(id) {
  const friendsGraph = await dataBase_default.dataGraph.c("friends").find({ $or: [{ a: id }, { b: id }] });
  const friends = friendsGraph.map((f) => {
    if (f.a == id)
      return f.b;
    return f.a;
  });
  friends.forEach((f) => {
    sendToUser(f, "refreshData", "friend.get.all");
  });
}
var evt_default = (socket) => {
  const uid = socket.user._id;
  socket.on("disconnect", () => {
    const sockets = io.room("user-" + uid).size;
    if (sockets > 0)
      return;
    rm(`userFiles/${uid}`, { recursive: true, force: true }, (err) => {
      if (err)
        console.log(err);
    });
    rmCache(uid);
    updateFriendList(uid);
  });
  socket.on("logout", async (cb) => {
    const token = socket.authData.token;
    dataBase_default.data.c("token").removeOne({ token });
    dataBase_default.data.c("fireToken").removeOne({ fc: token });
    socket.user = null;
    if (cb)
      cb();
    setTimeout(() => {
      try {
        socket.disconnect();
      } catch {}
    }, 100);
  });
  if (io.room("user-" + uid).size == 1)
    updateFriendList(uid);
};
var init_evt = __esm(async () => {
  init_server();
  await __promiseAll([
    init_status(),
    init_dataBase(),
    init_socket()
  ]);
});

// back/socket/chat/logic/realmSettings/get.ts
async function realm_settings_get(suser, id, sections = []) {
  const validator = new ValidError("realm.settings.get");
  if (!validData_default.id(id))
    return validator.valid("id");
  if (!validData_default.arrayString(sections))
    return validator.valid("sections");
  sections = sections.length ? sections : [...DEFAULT_SECTIONS];
  const permSystem = new PermissionSystem(id);
  const userPerms = await permSystem.getUserPermissions(suser._id);
  if (!hasRequiredPermissions(userPerms)) {
    return validator.err("You don't have permission to edit this realm");
  }
  const data = {
    addons: {}
  };
  const dbData = await fetchRequiredData(id, sections);
  await Promise.all(sections.map((section) => processSection(section, data, dbData, userPerms, id, suser._id)));
  return { err: false, res: data };
}
function hasRequiredPermissions(userPerms) {
  const requiredPerms = [
    permission_default.admin,
    permission_default.manageEmojis,
    permission_default.manageInvites,
    permission_default.manageMessages,
    permission_default.manageRoles,
    permission_default.manageWebhooks
  ];
  return hasAnyPermission(userPerms, requiredPerms);
}
function canAccessData(userPerms, requiredPerms = []) {
  return hasAnyPermission(userPerms, [
    permission_default.admin,
    ...requiredPerms
  ]);
}
async function fetchRequiredData(id, sections) {
  const sectionsRequiringDb = [
    "meta",
    "categories",
    "channels",
    "banUsers",
    "emojis",
    "webhooks"
  ];
  if (!sections.some((section) => sectionsRequiringDb.includes(section))) {
    return null;
  }
  return await dataBase_default.realmConf.c(id).find({});
}
async function processSection(section, data, dbData, userPerms, realmId, userId) {
  if (!canAccessData(userPerms, REQUIRED_PERMISSIONS[section])) {
    return;
  }
  switch (section) {
    case "meta":
      const metaData = dbData.find((d) => d._id === "set");
      if (metaData) {
        const { _id, ...meta } = metaData;
        data.meta = meta;
      }
      break;
    case "categories":
      data.categories = dbData.filter((d) => !!d.cid);
      break;
    case "channels":
      data.channels = dbData.filter((d) => !!d.chid);
      data.addons.subscribedChannels = await getSubscribedChannels(realmId);
      break;
    case "roles":
      data.roles = await getAdjustedRoles(realmId, userId);
      break;
    case "emojis":
      data.emojis = dbData.filter((d) => !!d.emoji);
      break;
    case "webhooks":
      data.webhooks = dbData.filter((d) => !!d.whid);
      break;
    case "banUsers":
      data.banUsers = dbData.filter((d) => !!d.ban).map((u) => u.ban);
      break;
    case "users":
      const users = await dataBase_default.realmUser.c(realmId).find({});
      data.users = users.map((u) => {
        let uid = u.u;
        if (u.bot)
          uid = "^" + u.bot;
        return { u: uid, r: u.r };
      });
      break;
    default:
      const n = section;
      return n;
  }
}
async function getAdjustedRoles(realm, userId) {
  const permSys = new PermissionSystem(realm);
  const allRoles = await permSys.getAllRolesSorted();
  const userHighestRole = await permSys.getUserHighestRole(userId);
  const highestLvl = userHighestRole.lvl;
  const adjustedData = [];
  for (const role of allRoles) {
    const adjRole = {
      _id: role._id,
      lvl: role.lvl,
      name: role.name,
      p: -1,
      c: role.c
    };
    if (role.lvl >= highestLvl) {
      adjRole.p = role.p;
    }
    adjustedData.push(adjRole);
  }
  return adjustedData;
}
async function getSubscribedChannels(realmId) {
  const channels = await dataBase_default.realmData.c("announcement.channels").find({
    tr: realmId
  }, {}, {
    exclude: ["tr"]
  });
  const realms = groupBySource(channels);
  for (const realm of realms) {
    const names = await dataBase_default.realmConf.c(realm.sr).find({
      $or: realm.scs.map((sc) => ({ chid: sc }))
    }, {}, {
      select: ["chid", "name"]
    });
    channels.forEach((channel) => {
      channel.name = names.find((n) => n.chid == channel.sc).name;
    });
  }
  return channels;
}
function groupBySource(data) {
  const grouped = {};
  data.forEach((chnl) => {
    const { sr, sc } = chnl;
    if (!grouped[sr]) {
      grouped[sr] = { sr, scs: [] };
    }
    grouped[sr].scs.push(sc);
  });
  return Object.values(grouped);
}
var DEFAULT_SECTIONS, REQUIRED_PERMISSIONS;
var init_get = __esm(async () => {
  init_validData();
  init_permission();
  await __promiseAll([
    init_permission_system(),
    init_dataBase()
  ]);
  DEFAULT_SECTIONS = [
    "meta",
    "categories",
    "channels",
    "roles",
    "users",
    "banUsers",
    "emojis",
    "webhooks"
  ];
  REQUIRED_PERMISSIONS = {
    meta: [],
    categories: [permission_default.manageChannels],
    channels: [permission_default.manageChannels],
    roles: [permission_default.manageRoles],
    emojis: [permission_default.manageEmojis],
    webhooks: [permission_default.manageWebhooks],
    banUsers: [permission_default.banUser],
    users: []
  };
});

// back/socket/chat/valid/realmsSettings.ts
var realmsSettings_default;
var init_realmsSettings = __esm(() => {
  realmsSettings_default = {
    type: "object",
    properties: {
      meta: {
        type: "object",
        properties: {
          name: { type: "string" },
          owner: { type: "string" },
          img: { type: "boolean" }
        },
        required: ["name", "owner"],
        additionalProperties: false
      },
      categories: {
        type: "array",
        items: {
          type: "object",
          properties: {
            cid: { type: "string", validId: true },
            name: { type: "string" },
            i: { type: "number" }
          },
          required: ["cid", "name", "i"],
          additionalProperties: false
        }
      },
      channels: {
        type: "array",
        items: {
          type: "object",
          properties: {
            chid: { type: "string", validId: true },
            name: { type: "string" },
            type: {
              type: "string",
              enum: [
                "text",
                "voice",
                "announcement",
                "open_announcement",
                "forum"
              ]
            },
            category: { type: "string" },
            i: { type: "number" },
            rp: {
              type: "array",
              items: { type: "string", channelRP: true }
            },
            desc: { type: "string", minLength: 0, maxLength: 150 }
          },
          required: ["chid", "name", "type", "category", "i", "rp"],
          additionalProperties: false
        }
      },
      roles: {
        type: "array",
        items: {
          type: "object",
          properties: {
            _id: { type: "string", validId: true },
            name: { type: "string" },
            lvl: { type: "integer", minimum: 0 },
            p: { type: "integer", minimum: 0 },
            c: { type: "string" }
          },
          required: ["_id", "p"],
          additionalProperties: false
        }
      },
      users: {
        type: "array",
        items: {
          type: "object",
          properties: {
            u: { type: "string", validIdWithPrefix: ["^", false] },
            r: {
              type: "array",
              items: { type: "string" }
            }
          },
          required: ["u", "r"],
          additionalProperties: false
        }
      },
      banUsers: {
        type: "array",
        items: {
          type: "string"
        }
      },
      emojis: {
        type: "array",
        items: {
          type: "object",
          properties: {
            name: { type: "string", minLength: 1, maxLength: 64 },
            emoji: { type: "string", validId: true }
          },
          required: ["name", "emoji"],
          additionalProperties: false
        }
      },
      webhooks: {
        type: "array",
        items: {
          type: "object",
          properties: {
            whid: { type: "string", validId: true },
            name: { type: "string" },
            chnl: { type: "string", validId: true },
            template: { type: "string", maxLength: 500 },
            required: { type: "array", items: { type: "string" } },
            ajv: { type: "object", additionalProperties: true },
            token: { type: "string" },
            embed: {
              type: "object",
              properties: {
                title: { type: "string" },
                url: { type: "string" },
                description: { type: "string" },
                image: { type: "string" },
                customFields: {
                  type: "object",
                  additionalProperties: { type: "string" }
                }
              },
              additionalProperties: false
            }
          },
          required: ["whid", "name", "chnl", "required", "ajv"],
          allOf: [
            {
              if: {
                not: { required: ["embed"] }
              },
              then: {
                properties: {
                  template: {
                    type: "string",
                    minLength: 1,
                    pattern: ".*\\S.*"
                  }
                },
                required: ["template"]
              }
            },
            {
              if: {
                required: ["embed"]
              },
              then: {
                required: ["template"]
              }
            }
          ],
          additionalProperties: false
        }
      }
    },
    additionalProperties: false
  };
});

// back/socket/chat/logic/realmSettings/set/banUsers.ts
var banUsers_default = async (id, data) => {};

// back/socket/chat/logic/realmSettings/set/utils.ts
async function saveDbChanges(doc, changes, idName = "_id") {
  const { itemsToAdd, itemsToRemove, itemsToUpdate, itemsWithRemovedFields } = changes;
  const dbc = dataBase_default.realmConf.c(doc);
  for (const item of itemsToAdd) {
    await dbc.add(item, false);
  }
  for (const item of itemsToRemove) {
    await dbc.remove({ [idName]: item[idName] }, { item, idName });
  }
  for (const item of itemsToUpdate) {
    await dbc.update({ [idName]: item[idName] }, item);
  }
  for (const item of itemsWithRemovedFields) {
    const unset = Object.fromEntries(item.deletedParams.map((p) => [p, true]));
    await dbc.update({ [idName]: item[idName] }, { $unset: unset });
  }
}
var init_utils = __esm(async () => {
  await init_dataBase();
});

// back/socket/chat/logic/realmSettings/set/categories.ts
var categories_default = async (id, data, suser, dbData) => {
  const oldCategories = dbData.filter((d) => ("cid" in d));
  const changes = processDbChanges(oldCategories, data.categories, ["name", "i"], "cid");
  await saveDbChanges(id, changes, "cid");
};
var init_categories = __esm(async () => {
  await __promiseAll([
    init_imports(),
    init_utils()
  ]);
});

// back/socket/chat/logic/realmSettings/set/channels.ts
var channels_default = async (id, data, suser, dbData) => {
  const oldChannels = dbData.filter((d) => ("chid" in d));
  const changes = processDbChanges(oldChannels, data.channels, ["name", "i", "rp", "desc"], "chid");
  await saveDbChanges(id, changes, "chid");
  for (const item of changes.itemsToUpdate) {
    permissionCache.clearChannelCache(id, item.chid);
  }
};
var init_channels = __esm(async () => {
  await __promiseAll([
    init_chnlPermissionCache(),
    init_imports(),
    init_utils()
  ]);
});

// back/socket/chat/logic/realmSettings/set/emojis.ts
import fs4 from "fs";
async function processEmojis(id, changes) {
  const basePath = `userFiles/realms/${id}/emojis/`;
  for (const rmEmoji of changes.itemsToRemove) {
    const path = `${basePath}${rmEmoji.emoji}.png`;
    if (fs4.existsSync(path))
      fs4.unlinkSync(path);
  }
  if (changes.itemsToRemove.length > 0) {
    const statements = changes.itemsToRemove.map((e) => ({
      emoji: e.emoji
    }));
    await dataBase_default.realmConf.c(id).remove({
      $or: statements
    });
  }
  for (const item of changes.itemsToUpdate) {
    await dataBase_default.realmConf.c(id).updateOne({ emoji: item.emoji }, item);
  }
}
var emojis_default = async (id, data, suser, dbData) => {
  const oldEmojis = dbData.filter((d) => ("emoji" in d));
  const changes = processDbChanges(oldEmojis, data.emojis, ["name"], "emoji");
  await processEmojis(id, changes);
};
var init_emojis = __esm(async () => {
  await init_imports();
});

// back/socket/chat/logic/realmSettings/set/meta.ts
import { unlinkSync } from "fs";
var meta_default = async (id, data) => {
  await dataBase_default.realmConf.c(id).updateOne({ _id: "set" }, data.meta);
  if (!data.meta.img) {
    try {
      unlinkSync("userFiles/realms/" + id + ".png");
    } catch {}
  }
};
var init_meta = __esm(async () => {
  await init_imports();
});

// back/socket/chat/logic/realmSettings/set/roles.ts
function processRoleUpdate(oldRoles, itemsToUpdate) {
  itemsToUpdate.forEach((role) => {
    const old = oldRoles.find((r) => r._id === role._id);
    if (role.lvl === old.lvl)
      delete role.lvl;
    if (role.name === old.name)
      delete role.name;
    if (role.c === old.c)
      delete role.c;
    if (role.p === old.p)
      delete role.p;
  });
}
var roles_default = async (id, data, suser) => {
  const permSys = new PermissionSystem(id);
  const oldRoles = await permSys.getAllRolesSorted();
  const newRoles = data.roles;
  const changes = processDbChanges(oldRoles, newRoles, ["lvl", "name", "c", "p"], "_id");
  const itemsToAdd = changes.itemsToAdd;
  const itemsToRemove = changes.itemsToRemove;
  const itemsToUpdate = changes.itemsToUpdate;
  processRoleUpdate(oldRoles, itemsToUpdate);
  for (const role of itemsToRemove) {
    await permSys.deleteRole(role._id, suser._id);
  }
  if (itemsToRemove.length > 0 && data.users) {
    const rids = itemsToRemove.map((role) => role._id);
    for (const user of data.users) {
      for (const rid of rids) {
        user.r = user.r.filter((r) => r !== rid);
      }
    }
  }
  for (const role of itemsToAdd) {
    await permSys.createRole(role.name, {
      p: role.p || 0,
      lvl: role.lvl || null,
      c: role.c || "#fff",
      managerId: suser._id
    });
  }
  for (const role of itemsToUpdate) {
    await permSys.updateRole(role._id, role, suser._id);
  }
};
var init_roles = __esm(async () => {
  await init_imports();
});

// back/socket/chat/logic/realmSettings/set/users.ts
async function saveDbChanges2(realmId, changes, trackName) {
  const itemsToUpdate = changes.itemsToUpdate;
  for (const item of itemsToUpdate) {
    await dataBase_default.realmUser.c(realmId).updateOne({
      [trackName]: item[trackName]
    }, item);
  }
}
var users_default = async (id, data) => {
  const old_data = await dataBase_default.realmUser.c(id).find({});
  let new_data = data.users;
  const new_users = new_data.filter((user) => /^[a-zA-Z0-9]/.test(user.u)).map((user) => {
    return {
      u: user.u,
      r: user.r
    };
  });
  const old_users = old_data.filter((user) => user.u);
  const changes_users = processDbChanges(old_users, new_users, ["u", "r"], "u");
  const new_bots = new_data.filter((user) => user.u.startsWith("^")).map((user) => {
    return {
      bot: user.u.replace("^", ""),
      r: user.r
    };
  });
  const old_bots = old_data.filter((user) => user.bot);
  const changes_bots = processDbChanges(old_bots, new_bots, ["bot", "r"], "bot");
  await saveDbChanges2(id, changes_users, "u");
  await saveDbChanges2(id, changes_bots, "bot");
};
var init_users = __esm(async () => {
  await init_imports();
});

// back/logic/webhooks/custom.ts
function getNestedValue(obj, path) {
  return path.split(".").reduce((current, part) => {
    if (part.includes("[") && part.includes("]")) {
      const [arrayName, indexStr] = part.split("[");
      const index = parseInt(indexStr.replace("]", ""));
      return current[arrayName][index];
    }
    return current[part];
  }, obj);
}
function processTemplate(template, obj) {
  return template.replace(/\$([a-zA-Z0-9\[\]._]+)/g, (match, path) => {
    try {
      const value = getNestedValue(obj, path);
      return value !== undefined ? value : match;
    } catch (error) {
      return match;
    }
  });
}
function checkRequiredFields(fields, data) {
  return fields.every((field) => {
    return getNestedValue(data, field) !== undefined;
  });
}
function ajvSchema(schema, data) {
  const ajv2 = validData_default.objAjv(schema);
  return ajv2(data);
}
function check(webhook, data) {
  let isValid = true;
  if (webhook.ajv && !ajvSchema(webhook.ajv, data))
    isValid = false;
  if (webhook.required.length > 0 && !checkRequiredFields(webhook.required, data))
    isValid = false;
  return isValid;
}
var init_custom = __esm(() => {
  init_validData();
});

// back/logic/webhooks/index.ts
import { genId as genId4 } from "@wxn0brp/db";
async function addCustom(webhookInfo) {
  const { chat, chnl, name, template, ajv: ajv2, required } = webhookInfo;
  const webhook = {
    whid: genId4(),
    name,
    template,
    chnl,
    ajv: ajv2 || {},
    required: required || []
  };
  await dataBase_default.realmConf.c(chat).add(webhook, false);
}
async function handleCustom(query, body) {
  const token = await decode(query.token, 4 /* WEBHOOK_TOKEN */);
  if (!token)
    return { code: 400, msg: "Invalid token" };
  const wh = await dataBase_default.realmConf.c(token.chat).findOne({
    whid: token.id
  });
  if (!wh)
    return { code: 404, msg: "Webhook not found" };
  const isValid = check(wh, body);
  if (!isValid)
    return { code: 400, msg: "Invalid data" };
  const formattedMessage = processTemplate(wh.template, body);
  const message = {
    to: token.chat,
    chnl: wh.chnl,
    msg: formattedMessage,
    silent: query.silent === "true" || false
  };
  let embed = null;
  if (wh.embed) {
    const { title, description, url, image, customFields } = wh.embed;
    embed = {
      title: processTemplate(title, body)
    };
    if (description)
      embed.description = processTemplate(description, body);
    if (url)
      embed.url = processTemplate(url, body);
    if (image)
      embed.image = processTemplate(image, body);
    if (customFields) {
      embed.customFields = {};
      for (const [key, value] of Object.entries(customFields)) {
        const template = value;
        embed.customFields[key] = processTemplate(template, body);
      }
    }
  }
  const res = await sendMessage(message, {
    _id: wh.whid,
    name: wh.name
  }, {
    system: true,
    customFields: {
      embed: embed ? embed : undefined
    },
    frPrefix: "%"
  });
  if (res.err) {
    const err = res.err;
    if (err[0] === "error.valid") {
      return { code: 400, msg: "Invalid data" };
    } else {
      return {
        code: 400,
        msg: "Invalid data: " + err.slice(1).join(", ")
      };
    }
  }
  return { code: 200, msg: "Webhook processed and message sent" };
}
var init_webhooks = __esm(async () => {
  init_custom();
  await __promiseAll([
    init_sendMessage(),
    init_token(),
    init_dataBase()
  ]);
});

// back/socket/chat/logic/realmSettings/set/webhooks.ts
var webhooks_default = async (id, data, suser, dbData) => {
  const oldWebhooks = dbData.filter((d) => ("whid" in d));
  const changes = processDbChanges(oldWebhooks, data.webhooks, ["name", "template", "chnl", "require", "ajv", "embed"], "whid");
  const itemsToAdd = [...changes.itemsToAdd];
  changes.itemsToAdd = [];
  await saveDbChanges(id, changes, "whid");
  for (const item of itemsToAdd) {
    const webhookInfo = {
      name: item.name,
      chat: id,
      chnl: item.chnl,
      template: item.template,
      required: item.require || [],
      ajv: item.ajv || {}
    };
    await addCustom(webhookInfo);
  }
  for (const item of changes.itemsToRemove) {
    await dataBase_default.data.c("rm").add({ _id: item.whid });
  }
};
var init_webhooks2 = __esm(async () => {
  await __promiseAll([
    init_utils(),
    init_webhooks(),
    init_imports()
  ]);
});

// back/socket/chat/logic/realmSettings/set/cpu.ts
var cpu_default;
var init_cpu = __esm(async () => {
  await __promiseAll([
    init_categories(),
    init_channels(),
    init_emojis(),
    init_meta(),
    init_roles(),
    init_users(),
    init_webhooks2()
  ]);
  cpu_default = {
    banUsers: banUsers_default,
    categories: categories_default,
    channels: channels_default,
    emojis: emojis_default,
    meta: meta_default,
    roles: roles_default,
    users: users_default,
    webhooks: webhooks_default
  };
});

// back/socket/chat/logic/realmSettings/set.ts
async function realm_settings_set(suser, id, data) {
  const validE2 = new ValidError("realm.settings.set");
  if (!validData_default.id(id))
    return validE2.valid("id");
  if (!validateData(data, setRealmSettingsSchema)) {
    return validE2.valid("data", setRealmSettingsSchema.errors);
  }
  if (!await validatePermissions(suser._id, id, data)) {
    return validE2.err(codes_default.UserError.Socket.RealmSettingsSet_InsufficientPermissions);
  }
  try {
    const sections = Object.keys(data);
    const dbData = await fetchRequiredData2(id, sections);
    await processAllSections(id, data, dbData, suser);
    notifyUsersAboutChanges(id, sections);
    return { err: false };
  } catch (error) {
    console.error("Error in realm_settings_set:", error);
    return validE2.err(codes_default.ServerError.Socket.RealmSettingsSet_Failed);
  }
}
async function validatePermissions(userId, realmId, data) {
  const permSys = new PermissionSystem(realmId);
  const userPerms = await permSys.getUserPermissions(userId);
  return Object.keys(data).every((section) => {
    const requiredPerms = sect_req_perms[section] || [];
    if (requiredPerms.length === 0)
      return true;
    return hasAnyPermission(userPerms, requiredPerms);
  });
}
function validateData(data, schema) {
  if (!schema(data)) {
    if (true) {
      lo("Validation errors:", schema.errors);
      lo("Invalid data:", data);
    }
    return false;
  }
  return true;
}
async function fetchRequiredData2(id, sections) {
  if (sections.some((section) => db_data_req_sect.includes(section)))
    return await dataBase_default.realmConf.c(id).find();
  return null;
}
async function processAllSections(id, data, dbData, suser) {
  for (const [section, processor] of Object.entries(cpu_default)) {
    if (data[section]) {
      await processor(id, data, suser, dbData);
    }
  }
}
function notifyUsersAboutChanges(id, sections) {
  sendToRealmUsers(id, "refreshData", {
    realm: id,
    evt: ["realm.setup", "realm.users.sync"]
  }, id);
  if (sections.includes("meta")) {
    sendToRealmUsers(id, "refreshData", {
      evt: "realm.get",
      wait: 1000
    });
  }
}
var sect_req_perms, db_data_req_sect, setRealmSettingsSchema;
var init_set = __esm(async () => {
  init_codes();
  init_permission();
  init_validData();
  init_realmsSettings();
  await __promiseAll([
    init_dataBase(),
    init_permission_system(),
    init_socket(),
    init_cpu()
  ]);
  sect_req_perms = {
    meta: [permission_default.admin],
    categories: [permission_default.admin, permission_default.manageChannels],
    channels: [permission_default.admin, permission_default.manageChannels],
    roles: [permission_default.admin, permission_default.manageRoles],
    users: [],
    emojis: [permission_default.admin, permission_default.manageEmojis],
    webhooks: [permission_default.admin, permission_default.manageWebhooks],
    banUsers: [permission_default.admin, permission_default.banUser]
  };
  db_data_req_sect = ["categories", "channels", "emojis", "webhooks"];
  setRealmSettingsSchema = validData_default.objAjv(realmsSettings_default);
});

// back/socket/chat/logic/realmSettings.ts
async function realm_webhook_token_get(suser, realmId, webhookId) {
  const validE2 = new ValidError("realm.webhook.token.get");
  if (!validData_default.id(realmId))
    return validE2.valid("realmId");
  if (!validData_default.id(webhookId))
    return validE2.valid("webhookId");
  const permSystem = new PermissionSystem(realmId);
  const userPerms = await permSystem.canUserPerformAnyAction(suser._id, [
    permission_default.admin,
    permission_default.manageWebhooks
  ]);
  if (!userPerms)
    return validE2.err(codes_default.UserError.Socket.RealmEdit_NotAuthorized);
  const webhook = await dataBase_default.realmConf.c(realmId).findOne({
    whid: webhookId
  });
  if (!webhook)
    return validE2.err(codes_default.UserError.Socket.RealmWebhookTokenGet_NotFound);
  const token = await create({
    id: webhook.whid,
    chat: realmId
  }, false, 4 /* WEBHOOK_TOKEN */);
  return { err: false, res: [token] };
}
var init_realmSettings = __esm(async () => {
  init_codes();
  init_validData();
  await __promiseAll([
    init_dataBase(),
    init_token(),
    init_KeyManager(),
    init_get(),
    init_set(),
    init_imports()
  ]);
});

// back/socket/chat/realmSettings.ts
var realmSettings_default = (socket) => {
  socket.onLimit("realm.settings.get", 5000, async (id, sections, cb) => {
    try {
      if (typeof sections == "function" && !cb) {
        cb = sections;
        sections = [];
      }
      const data = await realm_settings_get(socket.user, id, sections);
      if (socket.processSocketError(data))
        return;
      if (cb)
        cb(data.res, id);
      else
        socket.emit("realm.settings.get", data.res, id);
    } catch (e) {
      socket.logError(e);
    }
  });
  socket.onLimit("realm.settings.set", 5000, async (id, data, cb) => {
    try {
      const event_data = await realm_settings_set(socket.user, id, data);
      if (cb) {
        if (!event_data.err)
          return cb(false);
        return cb(...event_data.err);
      }
      socket.processSocketError(event_data);
    } catch (e) {
      socket.logError(e);
    }
  });
  socket.onLimit("realm.webhook.token.get", 5000, async (realmId, tokenId, cb) => {
    try {
      const data = await realm_webhook_token_get(socket.user, realmId, tokenId);
      if (socket.processSocketError(data))
        return;
      if (cb)
        cb(data.res);
      else
        socket.emit("realm.webhook.token.get", data.res);
    } catch (e) {
      socket.logError(e);
    }
  });
};
var init_realmSettings2 = __esm(async () => {
  await init_realmSettings();
});

// back/socket/chat/index.ts
function shouldRefreshToken({ iat, exp }) {
  const now = Math.floor(Date.now() / 1000);
  const lifespan = exp - iat;
  const elapsedTime = now - iat;
  return elapsedTime >= lifespan * 0.75;
}
var init_chat = __esm(async () => {
  init_server();
  init_limiter();
  await __promiseAll([
    init_dataBase(),
    init_auth(),
    init_evt(),
    init_realmSettings2(),
    init_register()
  ]);
  io.of("/").auth(async ({ token }) => {
    if (!token)
      return {
        status: 401,
        msg: "Token not provided"
      };
    const tokenData = { data: null };
    const user = await authUser(token, tokenData);
    if (!user)
      return {
        status: 401,
        msg: "Unauthorized"
      };
    if (bannedUsers.has(user._id)) {
      const userTime = bannedUsers.get(user._id);
      const remainingTime = userTime - Date.now();
      if (remainingTime > 0) {
        const time = Math.ceil(remainingTime / 1000 / 60) + 1;
        return {
          status: 403,
          msg: `Ban: You are temporarily banned. Please try again after ${time} minutes.`
        };
      } else {
        bannedUsers.delete(user._id);
      }
    }
    return {
      status: 200,
      toSet: {
        isShouldRefresh: shouldRefreshToken(tokenData.data)
      },
      user
    };
  });
  io.of("/").onConnect(async (socket) => {
    socket.joinRoom("user-" + socket.user._id);
    socket.logError = (e) => {
      lo("Error: ", e);
      dataBase_default.logs.c("gl").add({
        error: e.message,
        stackTrace: e.stack
      });
    };
    const limiter = new limiter_default(socket);
    socket.onLimit = limiter.onLimit.bind(limiter);
    socket.processSocketError = (res, cb) => {
      const err = res.err;
      if (!Array.isArray(err))
        return false;
      const [event, ...args] = err;
      if (cb)
        cb(...args);
      else
        socket.emit(event, ...args);
      return true;
    };
    register_default(socket);
    realmSettings_default(socket);
    evt_default(socket);
    setTimeout(async () => {
      if (socket.isShouldRefresh) {
        const oldToken = socket.authData.token;
        const newToken = await createUser({ _id: socket.user._id });
        socket.emit("system.refreshToken", newToken, function confirm(confirm) {
          if (!confirm)
            return;
          dataBase_default.data.c("token").updateOne({ token: oldToken }, { token: newToken });
        });
      }
      delete socket.isShouldRefresh;
    }, 2000);
  });
});

// back/socket/dev-panel/logic/mainList.ts
import { genId as genId5 } from "@wxn0brp/db";
async function bots_get(suser) {
  const botsData = await dataBase_default.userData.c(suser._id).find({
    $exists: { botID: true }
  });
  const botsID = botsData.map((b) => b.botID);
  const botsPromises = botsID.map(async (id) => {
    const bot = await dataBase_default.botData.c(id).findOne({
      _id: "name"
    });
    return { id, name: bot.name };
  });
  const bots = await Promise.all(botsPromises);
  return { err: false, res: [bots] };
}
async function bots_delete(suser, id) {
  const validE2 = new ValidError("bots.delete");
  if (!validData_default.id(id))
    return validE2.valid("id");
  const botExists = await dataBase_default.userData.c(suser._id).findOne({ botID: id });
  if (!botExists)
    return validE2.err(codes_default.UserError.Socket.DevPanel_BotNotFound);
  const realms = await dataBase_default.botData.c(id).find({
    $exists: { realm: true }
  });
  for (const realm of realms) {
    await dataBase_default.realmUser.c(realm.realm).removeOne({ bot: id });
  }
  await dataBase_default.userData.c(suser._id).removeOne({ botID: id });
  await dataBase_default.botData.removeCollection(id);
  await dataBase_default.data.c("rm").add({ _id: id });
  return { err: false };
}
async function bots_create(suser, name) {
  const validE2 = new ValidError("bots.create");
  if (!validData_default.str(name, 0, 30))
    return validE2.valid("name");
  const id = genId5();
  await dataBase_default.userData.c(suser._id).add({ botID: id }, false);
  await dataBase_default.botData.ensureCollection(id);
  await dataBase_default.botData.c(id).add({ _id: "owner", owner: suser._id }, false);
  await dataBase_default.botData.c(id).add({ _id: "name", name }, false);
  return { err: false, res: [id] };
}
var init_mainList = __esm(async () => {
  init_codes();
  init_validData();
  await init_dataBase();
});

// back/socket/dev-panel/valid/edit.ts
var infoSchema;
var init_edit = __esm(() => {
  infoSchema = {
    type: "object",
    properties: {
      name: { type: "string", minLength: 1, maxLength: 64 }
    },
    required: ["name"],
    additionalProperties: false
  };
});

// back/socket/dev-panel/logic/menageBot.ts
import { genId as genId6 } from "@wxn0brp/db";
import fs5 from "fs";
import { AnotherCache as AnotherCache8 } from "@wxn0brp/ac";
async function canUserEditBot(suser, id) {
  if (cache5.has(suser._id)) {
    return cache5.get(suser._id).includes(id);
  }
  const bots = await dataBase_default.userData.c(suser._id).find({
    $exists: { botID: true }
  }).then((b) => b.map((b2) => b2.botID));
  cache5.set(suser._id, bots);
  return bots.includes(id);
}
async function bot_edit(suser, id, info) {
  const validE2 = new ValidError("bot.edit");
  if (!validData_default.id(id))
    return validE2.valid("id");
  if (!editInfoSchemat(info))
    return validE2.valid("info");
  const canEdit = await canUserEditBot(suser, id);
  if (!canEdit)
    return validE2.err(codes_default.UserError.Socket.DevPanel_BotNotFound);
  const perm = await dataBase_default.userData.c(suser._id).findOne({
    botID: id
  });
  if (!perm)
    return validE2.err(codes_default.UserError.Socket.DevPanel_BotNotFound);
  await dataBase_default.botData.c(id).updateOne({ _id: "name" }, { name: info.name });
  return { err: false };
}
async function bot_get_realms(suser, id) {
  const validE2 = new ValidError("bot.get.realms");
  if (!validData_default.id(id))
    return validE2.valid("id");
  const canEdit = await canUserEditBot(suser, id);
  if (!canEdit)
    return validE2.err(codes_default.UserError.Socket.DevPanel_BotNotFound);
  const realms = await dataBase_default.botData.c(id).find({
    $exists: { realm: true }
  });
  const res = realms.map((r) => r.realm);
  return { err: false, res: [res] };
}
async function bot_realm_exit(suser, id, realm) {
  const validE2 = new ValidError("bot.realm.exit");
  if (!validData_default.id(id))
    return validE2.valid("id");
  if (!validData_default.id(realm))
    return validE2.valid("realm");
  const canEdit = await canUserEditBot(suser, id);
  if (!canEdit)
    return validE2.err(codes_default.UserError.Socket.DevPanel_BotNotFound);
  const bot = await dataBase_default.botData.c(id).findOne({ realm });
  if (!bot)
    return validE2.err(codes_default.UserError.Socket.DevPanel_BotNotFound);
  await dataBase_default.realmUser.c(realm).removeOne({ bot: id });
  await dataBase_default.botData.c(id).removeOne({ realm });
  return { err: false };
}
async function bot_generate_token(suser, id) {
  const validE2 = new ValidError("bot.generate.token");
  if (!validData_default.id(id))
    return validE2.valid("id");
  const canEdit = await canUserEditBot(suser, id);
  if (!canEdit)
    return validE2.err(codes_default.UserError.Socket.DevPanel_BotNotFound);
  const payload = {
    rand: genId6(),
    _id: id
  };
  const token = await create(payload, false, 3 /* BOT_TOKEN */);
  await dataBase_default.botData.c(id).updateOneOrAdd({ _id: "token" }, { token });
  return { err: false, res: [token] };
}
async function bot_profile_remove(suser, id) {
  const validE2 = new ValidError("bot.profile.remove");
  if (!validData_default.id(id))
    return validE2.valid("id");
  const canEdit = await canUserEditBot(suser, id);
  if (!canEdit)
    return validE2.err(codes_default.UserError.Socket.DevPanel_BotNotFound);
  await dataBase_default.botData.c(id).removeOne({ _id: "img" });
  const path = "userFiles/profiles/" + id + ".png";
  if (fs5.existsSync(path))
    fs5.unlinkSync(path);
  return { err: false };
}
var editInfoSchemat, cache5;
var init_menageBot = __esm(async () => {
  init_codes();
  init_validData();
  init_edit();
  await __promiseAll([
    init_dataBase(),
    init_token(),
    init_cacheSettings()
  ]);
  editInfoSchemat = validData_default.objAjv(infoSchema);
  cache5 = new AnotherCache8(getCacheSettings("BotEdit"));
});

// back/socket/dev-panel/register.ts
var events, register_default3 = (socket) => {
  const engine = new engine_default(socket);
  for (const event of events) {
    engine.add(event[0], event[1], event[2], event[3]);
  }
};
var init_register3 = __esm(async () => {
  init_engine();
  await __promiseAll([
    init_mainList(),
    init_menageBot()
  ]);
  events = [
    ["bots.get", 1000, true, bots_get],
    ["bot.delete", 1000, true, bots_delete],
    ["bot.create", 1000, true, bots_create],
    ["bot.edit", 1000, true, bot_edit],
    ["bot.get.realms", 1000, true, bot_get_realms],
    ["bot.realm.exit", 1000, true, bot_realm_exit],
    ["bot.generate.token", 1000, true, bot_generate_token],
    ["bot.profile.remove", 1000, true, bot_profile_remove]
  ];
});

// back/socket/dev-panel/index.ts
var init_dev_panel = __esm(async () => {
  init_limiter();
  init_server();
  await __promiseAll([
    init_dataBase(),
    init_auth(),
    init_register3()
  ]);
  io.of("/dev-panel").auth(async ({ token }) => {
    if (!token)
      return {
        status: 401,
        msg: "Unauthorized"
      };
    const tokenData = { data: null };
    const user = await authUser(token, tokenData);
    if (!user)
      return {
        status: 401,
        msg: "Unauthorized"
      };
    if (bannedUsers.has(user._id)) {
      const userTime = bannedUsers.get(user._id);
      const remainingTime = userTime - Date.now();
      if (remainingTime > 0) {
        const time = Math.ceil(remainingTime / 1000 / 60) + 1;
        return {
          status: 403,
          msg: `Ban: You are temporarily banned. Please try again after ${time} minutes.`
        };
      }
    }
    return {
      status: 200,
      user
    };
  });
  io.of("/dev-panel").onConnect((socket) => {
    socket.logError = (e) => {
      lo("Error: ", e);
      dataBase_default.logs.c("gl").add({
        error: e.message,
        stackTrace: e.stack
      });
    };
    const limiter = new limiter_default(socket);
    socket.onLimit = limiter.onLimit.bind(limiter);
    socket.processSocketError = (res, cb) => {
      const err = res.err;
      if (!Array.isArray(err))
        return false;
      const [event, ...args] = err;
      if (cb)
        cb(...args);
      else
        socket.emit(event, ...args);
      return true;
    };
    register_default3(socket);
  });
});

// back/socket/qrCodeLogin.ts
function roleGet(socket, data) {
  socket.device = data.device;
  socket.joinRoom("qrCodeLogin-" + data.id);
}
function emitError(socket, error) {
  const err = error.err;
  socket.emit(err[0], ...err.slice(1));
}
async function roleAuth(socket, data) {
  const room = io.room("qrCodeLogin-" + data.to);
  if (room.size !== 1)
    return emitError(socket, new ValidError("socket").valid("socket"));
  const to_socket = room.sockets[0];
  socket.emit("device", to_socket.device);
  socket.on("auth", async (data2, cb) => {
    const validE2 = new ValidError("auth");
    if (!data2.token)
      return emitError(socket, validE2.valid("token"));
    if (!data2._id)
      return emitError(socket, validE2.valid("_id"));
    if (!data2.fr)
      return emitError(socket, validE2.valid("fr"));
    const user = await authUser(data2.token);
    if (!user)
      return emitError(socket, validE2.err("auth"));
    if (user._id !== data2._id)
      return emitError(socket, validE2.err("auth"));
    if (user.name !== data2.fr)
      return emitError(socket, validE2.err("auth"));
    const newToken = await createUser(user);
    await dataBase_default.data.c("token").add({ token: newToken }, false);
    to_socket.emit("get", newToken, user.name, user._id);
    if (cb && typeof cb === "function")
      cb();
  });
}
var init_qrCodeLogin = __esm(async () => {
  init_server();
  await __promiseAll([
    init_dataBase(),
    init_auth()
  ]);
  io.of("/qrCodeLogin").auth(async ({ data }) => {
    if (!data)
      return { status: 401, msg: "Role not provided" };
    const role = data.role;
    if (!role)
      return { status: 401, msg: "Role not provided" };
    if (role == "auth") {
      if (!data.to)
        return { status: 401, msg: "To not provided" };
      return { status: 200 };
    }
    if (role == "get") {
      if (!data.id)
        return { status: 401, msg: "Id not provided" };
      if (!data.device)
        return { status: 401, msg: "Device not provided" };
      return { status: 200 };
    }
    return { status: 401, msg: "Role not provided" };
  });
  io.of("/qrCodeLogin").onConnect((socket, authData) => {
    const auth = authData.data;
    if (auth.role == "get")
      roleGet(socket, auth);
    else if (auth.role == "auth")
      roleAuth(socket, auth);
  });
});

// back/socket/index.ts
async function sendToRealmUsers(realm, channel, ...args) {
  const users = await dataBase_default.realmUser.c(realm).find({});
  for (const user of users) {
    const room = "bot" in user ? "bot-" + user.bot : "user-" + user.u;
    io.room(room).emit(channel, ...args);
  }
}
async function sendToUser(id, event, ...args) {
  io.room("user-" + id).emit(event, ...args);
}
var init_socket = __esm(async () => {
  init_server();
  await __promiseAll([
    init_dataBase(),
    init_bot(),
    init_chat(),
    init_dev_panel(),
    init_qrCodeLogin()
  ]);
});

// back/schedule/actions/event.ts
var event_default2 = async (data, taskId) => {
  if (!activeTasks.has(taskId))
    return;
  const users = await dataBase_default.realmData.c(data.realm).find({ uevt: data.evt }, {}, {}, { select: ["u"] });
  users.forEach(({ u }) => {
    sendToUser(u, "realm.event.notify", data.realm, data.evt);
  });
};
var init_event2 = __esm(async () => {
  await __promiseAll([
    init_schedule(),
    init_dataBase(),
    init_socket()
  ]);
});

// back/schedule/actions/index.ts
var actions, actions_default;
var init_actions = __esm(async () => {
  await __promiseAll([
    init_deleteAccount2(),
    init_event2()
  ]);
  actions = {
    deleteAccount: deleteAccount_default2,
    event: event_default2
  };
  actions_default = actions;
});

// back/schedule/index.ts
import schedule from "node-schedule";
function performTask(actionType, data, taskId) {
  const action = actions_default[actionType];
  if (!action)
    return console.log(`Unknown action type: ${actionType}`);
  action(data, taskId);
  removeTask(taskId);
}
function scheduleOneTimeTask(task) {
  const { _id, type, sTime, data } = task;
  let scheduledDate = new Date;
  if (typeof sTime == "string")
    scheduledDate = new Date(sTime);
  else if (typeof sTime == "number")
    scheduledDate = new Date(sTime * 1000);
  const currentTime = new Date;
  const timeDiff = scheduledDate.getTime() - currentTime.getTime();
  if (timeDiff <= 1e4) {
    performTask(type, data, _id);
  } else {
    const job = schedule.scheduleJob(_id, scheduledDate, () => {
      if (!activeTasks.has(_id))
        return;
      performTask(type, data, _id);
    });
    activeTasks.set(_id, job);
  }
}
function processTask(task) {
  if (task.sType === "one-time")
    scheduleOneTimeTask(task);
}
function loadTasks() {
  dataBase_default.system.c("tasks").find({}).then((tasks) => {
    tasks.forEach((task) => processTask(task));
  });
}
async function cancelTask(taskId) {
  activeTasks.get(taskId)?.cancel();
  removeTask(taskId);
}
async function removeTask(taskId) {
  await dataBase_default.system.c("tasks").removeOne({ _id: taskId });
  if (!activeTasks.has(taskId))
    return;
  activeTasks.delete(taskId);
}
async function addTask(taskReq) {
  const task = await dataBase_default.system.c("tasks").add(taskReq);
  processTask(task);
  return task._id;
}
var activeTasks;
var init_schedule = __esm(async () => {
  await __promiseAll([
    init_actions(),
    init_dataBase()
  ]);
  activeTasks = new Map;
});

// back/bannedIp.ts
import { readFileSync, watchFile } from "fs";
function expressMiddleware(req, res, next) {
  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
  if (ip == "::1")
    return next();
  if (config3.includes(ip)) {
    return res.status(403).json({
      err: true,
      c: codes_default.UserError.Express.IpBanned,
      msg: "Access denied. IP address is banned."
    });
  }
  next();
}
function loadConfig2() {
  config3 = JSON.parse(readFileSync("config/bannedIP.json", "utf8"));
  if (!Array.isArray(config3)) {
    config3 = [];
    console.error("config/bannedIP.json must be an string array.");
  }
}
var config3;
var init_bannedIp = __esm(() => {
  init_codes();
  config3 = [];
  loadConfig2();
  watchFile("config/bannedIP.json", () => {
    loadConfig2();
  });
});

// back/http/api/account/login.ts
import { createHash, timingSafeEqual } from "crypto";
import { Router } from "@wxn0brp/falcon-frame";
function comparePasswords(hashPassword, inputPassword) {
  return timingSafeEqual(Buffer.from(hashPassword, "utf-8"), Buffer.from(generateHash(inputPassword), "utf-8"));
}
function generateHash(password) {
  return createHash("sha256").update(password).digest("hex");
}
function randomDelay(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}
var loginRouter;
var init_login = __esm(async () => {
  init_codes();
  init_mail();
  await __promiseAll([
    init_dataBase(),
    init_auth()
  ]);
  loginRouter = new Router;
  loginRouter.post("/login", async (req, res) => {
    const { name, password } = req.body;
    if (!name)
      return res.json({
        err: true,
        c: codes_default.UserError.Express.MissingParameters,
        msg: "name"
      });
    if (!password)
      return res.json({
        err: true,
        c: codes_default.UserError.Express.MissingParameters,
        msg: "password"
      });
    let user = await dataBase_default.data.c("user").findOne({ name });
    if (!user) {
      user = await dataBase_default.data.c("user").findOne({ email: name });
      if (!user) {
        await global.delay(randomDelay(500, 1500));
        return res.json({
          err: true,
          c: codes_default.UserError.Express.Login_InvalidCredentials,
          msg: "Invalid credentials"
        });
      }
    }
    const isPasswordValid = comparePasswords(user.password, password);
    if (!isPasswordValid) {
      await global.delay(randomDelay(500, 1500));
      return res.json({
        err: true,
        c: codes_default.UserError.Express.Login_InvalidCredentials,
        msg: "Invalid credentials"
      });
    }
    const token = await createUser(user);
    await global.delay(randomDelay(500, 1500));
    res.json({
      err: false,
      msg: "Login successful",
      token,
      from: user.name,
      user_id: user._id
    });
    await dataBase_default.data.c("token").add({ token }, false);
    if (global.logsConfig.mail.loginWarn) {
      const deviceInfo = req.headers["user-agent"] || "Unknown Device";
      mail_default("login", user.email, user.name, deviceInfo);
    }
  });
});

// back/http/api/account/deleteAccount.ts
import { Router as Router2 } from "@wxn0brp/falcon-frame";
var deleteAccountRouter;
var init_deleteAccount3 = __esm(async () => {
  init_codes();
  await __promiseAll([
    init_dataBase(),
    init_token(),
    init_schedule(),
    init_login()
  ]);
  deleteAccountRouter = new Router2;
  deleteAccountRouter.get("/get", async (req, res) => {
    const { token } = req.query;
    if (!token)
      return res.json({
        err: true,
        c: codes_default.UserError.Express.MissingParameters,
        msg: "token"
      });
    const tokenData = await decode(token, 0 /* GENERAL */);
    if (!tokenData)
      return res.json({
        err: true,
        c: codes_default.UserError.Express.DeleteAccountGet_InvalidToken,
        msg: "invalid token"
      });
    const user = await dataBase_default.data.c("user").findOne({
      _id: tokenData.user
    });
    if (!user)
      return res.json({
        err: true,
        c: codes_default.UserError.Express.DeleteAccountGet_UserNotFound,
        msg: "user is not found"
      });
    res.json({ err: false, name: user.name });
  });
  deleteAccountRouter.post("/confirm", async (req, res) => {
    const { token, pass } = req.body;
    if (!token)
      return res.json({
        err: true,
        c: codes_default.UserError.Express.MissingParameters,
        msg: "token"
      });
    if (!pass)
      return res.json({
        err: true,
        c: codes_default.UserError.Express.MissingParameters,
        msg: "pass"
      });
    randomDelay(500, 1500);
    const tokenData = await decode(token, 0 /* GENERAL */);
    if (!tokenData)
      return res.json({
        err: true,
        c: codes_default.UserError.Express.DeleteAccountConfirm_InvalidToken,
        msg: "invalid token"
      });
    const user = await dataBase_default.data.c("user").findOne({
      _id: tokenData.user
    });
    if (!user)
      return res.json({
        err: true,
        c: codes_default.UserError.Express.DeleteAccountConfirm_UserNotFound,
        msg: "user is not found"
      });
    const isPasswordValid = comparePasswords(user.password, pass);
    if (!isPasswordValid)
      return res.json({
        err: true,
        c: codes_default.UserError.Express.DeleteAccountConfirm_InvalidPassword,
        msg: "invalid password"
      });
    const existingTask = await dataBase_default.system.c("tasks").findOne({
      type: "deleteAccount",
      data: { user: user._id }
    });
    if (existingTask)
      return res.json({
        err: true,
        c: codes_default.UserError.Express.DeleteAccountConfirm_AlreadyPending,
        msg: "account is already pending to be deleted"
      });
    const removeTime = new Date().getTime() + 1000 * 60 * 60 * 24;
    await addTask({
      type: "deleteAccount",
      sType: "one-time",
      sTime: Math.floor(removeTime / 1000),
      data: {
        user: user._id
      }
    });
    res.json({ err: false, msg: "account pending to be deleted" });
  });
  deleteAccountRouter.post("/undo", async (req, res) => {
    const { token } = req.body;
    if (!token)
      return res.json({
        err: true,
        c: codes_default.UserError.Express.MissingParameters,
        msg: "token"
      });
    const tokenData = await decode(token, 0 /* GENERAL */);
    if (!tokenData)
      return res.json({
        err: true,
        c: codes_default.UserError.Express.DeleteAccountUndo_InvalidToken,
        msg: "invalid token"
      });
    const task = await dataBase_default.system.c("tasks").findOne({
      type: "deleteAccount",
      data: { user: tokenData.user }
    });
    if (!task)
      return res.json({
        err: true,
        c: codes_default.UserError.Express.DeleteAccountUndo_PendingNotFound,
        msg: "pending process is not found"
      });
    await dataBase_default.system.c("tasks").removeOne({
      type: "deleteAccount",
      data: { user: tokenData.user }
    });
    await cancelTask(task._id);
    res.json({ err: false, msg: "successfully remove pending to be deleted" });
  });
});

// back/http/api/account/register.ts
import { createHash as createHash2 } from "crypto";
import { Router as Router3 } from "@wxn0brp/falcon-frame";
function generateHash2(password) {
  return createHash2("sha256").update(password).digest("hex");
}
function generateVerificationCode() {
  return Math.floor(1e5 + Math.random() * 900000).toString();
}
var registerRouter;
var init_register4 = __esm(async () => {
  init_codes();
  init_mail();
  await init_dataBase();
  registerRouter = new Router3;
  registerRouter.post("/register", async function(req, res) {
    const { name, password, email } = req.body;
    if (!name)
      return res.json({
        err: true,
        c: codes_default.UserError.Express.MissingParameters,
        msg: "name"
      });
    if (!password)
      return res.json({
        err: true,
        c: codes_default.UserError.Express.MissingParameters,
        msg: "password"
      });
    if (!email)
      return res.json({
        err: true,
        c: codes_default.UserError.Express.MissingParameters,
        msg: "email"
      });
    const existingUserByName = await dataBase_default.data.c("user").findOne({ name });
    if (existingUserByName)
      return res.json({
        err: true,
        c: codes_default.UserError.Express.Register_UsernameTaken,
        msg: "User with this name already exists!"
      });
    const existingUserByEmail = await dataBase_default.data.c("user").findOne({ email });
    if (existingUserByEmail)
      return res.json({
        err: true,
        c: codes_default.UserError.Express.Register_EmailTaken,
        msg: "User with this email already exists!"
      });
    if (!/^[a-zA-Z0-9]+$/.test(name) || name.length < 3 || name.length > 10) {
      return res.json({
        err: true,
        c: codes_default.UserError.Express.Register_InvalidName,
        msg: "Username does not meet requirements!"
      });
    }
    if (!password.match(/[a-z]/) || !password.match(/[A-Z]/) || !password.match(/[0-9]/) || !password.match(/[-!$%^&*()_+|~=`{}\[\]:\/;<>?,.@#]/) || password.length < 8 || password.length > 300) {
      return res.json({
        err: true,
        c: codes_default.UserError.Express.Register_InvalidPassword,
        msg: "Password does not meet requirements!"
      });
    }
    const verificationCode = generateVerificationCode();
    const hashedPassword = generateHash2(password);
    const mailSent = mail_default("register", email, verificationCode);
    if (!mailSent) {
      console.error("Failed to send registration confirmation email");
      return res.json({
        err: true,
        c: codes_default.ServerError.Express.Register_FailedToSendEmail,
        msg: "Failed to send registration confirmation email"
      });
    }
    req.session.tmp_user = {
      name,
      password: hashedPassword,
      email,
      verificationCode,
      attemptsLeft: 3
    };
    res.json({ err: false, msg: "Verification code sent" });
  });
  registerRouter.post("/register/verify", async function(req, res) {
    if (!req.session.tmp_user)
      return res.json({
        err: true,
        c: codes_default.UserError.Express.RegisterVerify_InvalidSession,
        msg: "No authentication data found"
      });
    const { verificationCode } = req.session.tmp_user;
    const codeFromRequest = req.body.code;
    if (!codeFromRequest)
      return res.json({
        err: true,
        c: codes_default.UserError.Express.MissingParameters,
        msg: "verificationCode"
      });
    if (req.session.tmp_user.attemptsLeft <= 0) {
      delete req.session.tmp_user;
      return res.json({
        err: true,
        c: codes_default.UserError.Express.RegisterVerify_TooManyAttempts,
        msg: "Too many attempts"
      });
    }
    if (codeFromRequest !== verificationCode) {
      req.session.tmp_user.attemptsLeft -= 1;
      return res.json({
        err: true,
        c: codes_default.UserError.Express.RegisterVerify_InvalidCode,
        msg: `Invalid code. Attempts left: ${req.session.tmp_user.attemptsLeft}`,
        data: req.session.tmp_user.attemptsLeft
      });
    }
    const { name, email, password } = req.session.tmp_user;
    const newUser = await dataBase_default.data.c("user").add({ name, email, password });
    if (!newUser)
      return res.json({
        err: true,
        c: codes_default.ServerError.Express.RegisterVerify_FailedToRegisterUser,
        msg: "Failed to register user"
      });
    delete req.session.tmp_user;
    res.json({ err: false, msg: "Welcome!" });
  });
});

// back/http/api/features/announcement.ts
import { Router as Router4 } from "@wxn0brp/falcon-frame";
var announcementRouter;
var init_announcement = __esm(async () => {
  init_codes();
  init_validData();
  await init_dataBase();
  announcementRouter = new Router4;
  announcementRouter.get("/announcement", async (req, res) => {
    let {
      realm,
      chnl,
      start: startStr,
      end: endStr
    } = req.query;
    const start = parseInt(startStr);
    const end = parseInt(endStr);
    if (!validData_default.id(realm))
      return res.json({
        err: true,
        c: codes_default.UserError.Express.MissingParameters,
        msg: "realm"
      });
    if (!validChannelId(chnl))
      return res.json({
        err: true,
        c: codes_default.UserError.Express.MissingParameters,
        msg: "channel"
      });
    if (!validData_default.num(start, 0))
      return res.json({
        err: true,
        c: codes_default.UserError.Express.MissingParameters,
        msg: "start"
      });
    if (!validData_default.num(end, 0))
      return res.json({
        err: true,
        c: codes_default.UserError.Express.MissingParameters,
        msg: "end"
      });
    const chnlData = await dataBase_default.realmConf.c("realmConf").findOne({ realm, chid: chnl });
    if (!chnlData)
      return res.json({
        err: true,
        c: codes_default.UserError.Express.Announcement_ChannelIsNotOpen,
        msg: "channel is not open event"
      });
    if (chnlData.type != "open_announcement")
      return res.json({
        err: true,
        c: codes_default.UserError.Express.Announcement_ChannelIsNotOpen,
        msg: "channel is not open announcement"
      });
    let data = await dataBase_default.mess.c(realm).find({ chnl }, { reverse: true, limit: end + start });
    data = data.slice(start, end).map((msg) => {
      return {
        fr: msg.fr,
        msg: msg.msg
      };
    });
    res.json({ err: false, data });
  });
});

// back/logic/inviteBot.ts
async function invite(userID, botID, realmID) {
  const permSys = new PermissionSystem(realmID);
  const userPerm = await permSys.canUserPerformAnyAction(userID, [
    permission_default.admin,
    permission_default.manageInvites
  ]);
  if (!userPerm)
    return {
      err: true,
      c: codes_default.UserError.Express.InviteBot_NotPermission,
      msg: "You don't have permission to edit this realm"
    };
  const botName = await dataBase_default.botData.c(botID).findOne({ _id: "name" });
  const role = await permSys.createRole(botName.name);
  await dataBase_default.botData.c(botID).add({ realm: realmID }, false);
  await dataBase_default.realmUser.c(realmID).add({ bot: botID, r: [role._id] }, false);
  return { err: false, msg: "ok" };
}
var init_inviteBot = __esm(async () => {
  init_codes();
  init_permission();
  await __promiseAll([
    init_dataBase(),
    init_permission_system()
  ]);
});

// back/http/api/auth.ts
var authenticateMiddleware = async (req, res, next) => {
  const token = req.headers["authorization"];
  if (!token) {
    return res.status(401).json({
      err: true,
      c: codes_default.UserError.Express.AuthError_TokenRequired,
      msg: "Access denied. No token provided."
    });
  }
  try {
    const user = await authUser(token);
    if (!user) {
      return res.status(401).json({
        err: true,
        c: codes_default.UserError.Express.AuthError_InvalidToken,
        msg: "Invalid token."
      });
    }
    req.user = user._id;
    next();
  } catch (err) {
    res.status(500).json({
      err: true,
      c: codes_default.ServerError.Express.AuthError,
      msg: "An error occurred during authentication."
    });
  }
};
var init_auth2 = __esm(async () => {
  init_codes();
  await init_auth();
});

// back/http/api/features/botInvite.ts
import { Router as Router5 } from "@wxn0brp/falcon-frame";
var inviteBotRouter, botInvite_default;
var init_botInvite = __esm(async () => {
  init_codes();
  await __promiseAll([
    init_dataBase(),
    init_inviteBot(),
    init_auth2()
  ]);
  inviteBotRouter = new Router5;
  inviteBotRouter.get("/", authenticateMiddleware, async (req, res) => {
    const { id, realm } = req.query;
    const { err, msg } = await invite(req.user, id, realm);
    res.json({ err, msg });
  });
  inviteBotRouter.get("/meta", authenticateMiddleware, async (req, res) => {
    const { id } = req.query;
    if (!id)
      return res.json({
        err: true,
        c: codes_default.UserError.Express.MissingParameters,
        msg: "id"
      });
    const botExists = await dataBase_default.botData.c(id).findOne({ _id: "owner" });
    if (!botExists)
      return res.json({
        err: true,
        c: codes_default.UserError.Express.BotInvite_NotFound,
        msg: "bot not found"
      });
    const botRes = {
      name: undefined,
      realms: undefined
    };
    botRes.name = await dataBase_default.botData.c(id).findOne({ _id: "name" }).then((b) => b.name);
    const userRealms = await dataBase_default.userData.c(req.user).find({
      $exists: { realm: true }
    });
    const botRealms = await dataBase_default.botData.c(id).find({ $exists: { realm: true } }).then((b) => b.map((r) => r.realm));
    const availableRealms = userRealms.filter((s) => !botRealms.includes(s.realm)).map((s) => s.realm);
    botRes.realms = availableRealms;
    res.json({ err: false, data: botRes });
  });
  botInvite_default = inviteBotRouter;
});

// back/http/api/features/fireToken.ts
import { Router as Router6 } from "@wxn0brp/falcon-frame";
var fireTokenRouter;
var init_fireToken = __esm(async () => {
  init_codes();
  await __promiseAll([
    init_dataBase(),
    init_mobileNotif()
  ]);
  fireTokenRouter = new Router6;
  fireTokenRouter.post("/fireToken", async (req, res) => {
    const { fcToken, fireToken } = req.body;
    if (!fcToken)
      return res.json({
        err: true,
        c: codes_default.UserError.Express.MissingParameters,
        msg: "fcToken"
      });
    if (!fireToken)
      return res.json({
        err: true,
        c: codes_default.UserError.Express.MissingParameters,
        msg: "fireToken"
      });
    const userToken = await getTokenFromPointer(fcToken);
    if (!userToken)
      return res.json({
        err: true,
        c: codes_default.UserError.Express.FireToken_InvalidFcToken,
        msg: "invalid fcToken"
      });
    const pairIsset = await dataBase_default.data.c("fireToken").findOne({
      fc: userToken.token,
      fire: fireToken
    });
    if (pairIsset)
      return res.json({ err: false, msg: "ok" });
    await dataBase_default.data.c("fireToken").removeOne({ fire: fireToken });
    await dataBase_default.data.c("fireToken").add({
      fc: userToken.token,
      fire: fireToken,
      user: userToken.user,
      exp: userToken.exp
    }, false);
    cache4.delete(fcToken);
    res.json({ err: false, msg: "ok" });
  });
});

// back/http/api/features/realmJoin.ts
import { Router as Router7 } from "@wxn0brp/falcon-frame";
var realmJoinRouter;
var init_realmJoin = __esm(async () => {
  init_codes();
  await __promiseAll([
    init_dataBase(),
    init_chats(),
    init_auth2()
  ]);
  realmJoinRouter = new Router7;
  realmJoinRouter.get("/meta", authenticateMiddleware, async (req, res) => {
    const { id } = req.query;
    if (!id)
      return res.json({
        err: true,
        c: codes_default.UserError.Express.MissingParameters,
        msg: "id"
      });
    const userExists = await dataBase_default.userData.c(req.user).findOne({ realm: id });
    if (userExists)
      return res.json({ err: false, state: 1 });
    const isBaned = await dataBase_default.realmData.c(id).findOne({ ban: req.user });
    if (isBaned)
      return res.json({ err: false, state: 2 });
    const realmRes = {
      name: undefined,
      img: undefined
    };
    const realmMeta = await dataBase_default.realmConf.c(id).findOne({
      _id: "set"
    });
    realmRes.name = realmMeta.name;
    realmRes.img = realmMeta.img || false;
    res.json({ err: false, state: 0, data: realmRes });
  });
  realmJoinRouter.get("/", authenticateMiddleware, async (req, res) => {
    const { id } = req.query;
    const suser = {
      _id: req.user,
      name: undefined,
      email: undefined
    };
    const data = await realm_join(suser, id);
    if (data.err) {
      const err = data.err;
      if (err[0] == "error.valid")
        return res.status(400).json({
          err: true,
          c: codes_default.UserError.Express.MissingParameters,
          msg: err[2]
        });
      else
        return res.json({
          err: true,
          c: codes_default.UserError.Express.RealmJoin,
          msg: err.slice(2)
        });
    }
    res.json({ err: false, msg: "ok" });
  });
});

// back/http/api/features/webhook.ts
import { Router as Router8 } from "@wxn0brp/falcon-frame";
var webhookRouter;
var init_webhook = __esm(async () => {
  init_validData();
  await init_webhooks();
  webhookRouter = new Router8;
  webhookRouter.post("/webhook/custom", async (req, res) => {
    const { query, body } = req;
    const queryData = query;
    if (!validData_default.str(queryData.token))
      return res.status(400).send("Token is required");
    const { code, msg } = await handleCustom(queryData, body);
    res.status(code).send(msg);
  });
});

// back/logic/cropAndResizeProfile.ts
function cropAndResizeProfile(image) {
  function getTargetSize() {
    const minDimension = Math.min(image.width, image.height);
    const powersOfTwo = [512, 256, 128];
    const targetSize2 = powersOfTwo.find((size) => minDimension >= size);
    return targetSize2 || 128;
  }
  const minSize = Math.min(image.width, image.height);
  const cropRegion = {
    x: (image.width - minSize) / 2,
    y: (image.height - minSize) / 2,
    width: minSize,
    height: minSize
  };
  const croppedImage = image.crop(cropRegion);
  const targetSize = getTargetSize();
  const resizedImage = croppedImage.resize({
    width: targetSize,
    height: targetSize
  });
  return resizedImage;
}

// back/http/profileUpload.ts
import { Router as Router9 } from "@wxn0brp/falcon-frame";
import { existsSync } from "fs";
import { Image } from "image-js";
import multer, { memoryStorage } from "multer";
import { join } from "path";

class FileUploadEngine {
  config;
  router;
  constructor(config4) {
    this.config = config4;
    this.router = new Router9;
    this.setupRoutes();
  }
  setupRoutes() {
    const storage = memoryStorage();
    const upload = multer({
      storage,
      limits: { fileSize: this.config.maxFileSize },
      fileFilter: (req, file2, cb) => {
        if (this.config.allowedFileTypes.includes(file2.mimetype)) {
          cb(null, true);
        } else {
          const formats = this.config.allowedFileTypes.map((type) => type.split("/")[1].toUpperCase()).join(", ");
          cb(new Error(`Invalid file type. Only ${formats} are allowed.`));
        }
      }
    }).single("file");
    this.router.post(this.config.routePath, authenticateMiddleware, async (req, res) => {
      if (this.config.permissionCheck) {
        const hasPermission2 = await this.config.permissionCheck(req);
        if (!hasPermission2) {
          return res.status(403).json({
            err: true,
            c: this.config.permissionCheckError || codes_default.UserError.Express.UploadError,
            msg: "You do not have permission to do that."
          });
        }
      }
      upload(req, res, async (err) => {
        if (err) {
          return res.status(400).json({
            err: true,
            c: codes_default.UserError.Express.UploadError,
            msg: err.message
          });
        }
        const ReqFile = req?.file;
        if (!ReqFile) {
          return res.status(400).json({
            err: true,
            c: codes_default.UserError.Express.FileUpload_NoFile,
            msg: "No file uploaded."
          });
        }
        const fileName = this.config.fileNameGenerator(req);
        const filePath = join(this.config.uploadDir, `${fileName}.png`);
        try {
          const image = await Image.load(ReqFile.buffer);
          const processedImage = cropAndResizeProfile(image);
          await processedImage.save(filePath, { format: "png" });
          if (this.config.postProcessCallback) {
            await this.config.postProcessCallback(filePath, req);
          }
          res.json({
            err: false,
            msg: "Profile picture uploaded successfully.",
            path: filePath
          });
        } catch (error) {
          res.status(500).json({
            err: true,
            c: codes_default.ServerError.Express.UploadError,
            msg: "An error occurred while processing the image."
          });
        }
      });
    });
  }
  getRouter() {
    return this.router;
  }
  createImageGetter(routePath, fileDirectory, defaultImagePath) {
    const imageRouter = new Router9;
    imageRouter.get(routePath, (req, res) => {
      function sendDefault() {
        res.setHeader("X-Content-Default", "true");
        res.sendFile(defaultImagePath);
      }
      const id = req.query.id;
      if (!id)
        return sendDefault();
      const file2 = join(fileDirectory, `${id}.png`);
      if (existsSync(file2)) {
        res.setHeader("X-Content-Default", "false");
        res.sendFile(file2);
      } else {
        sendDefault();
      }
    });
    return imageRouter;
  }
}
var profileUpload_default;
var init_profileUpload = __esm(async () => {
  init_codes();
  await init_auth2();
  profileUpload_default = FileUploadEngine;
});

// back/http/api/file/botProfile.ts
import { Router as Router10 } from "@wxn0brp/falcon-frame";
var botProfileRouter, UPLOAD_DIR = "userFiles/profiles", botProfileEngine;
var init_botProfile = __esm(async () => {
  init_validData();
  await __promiseAll([
    init_profileUpload(),
    init_menageBot(),
    init_dataBase()
  ]);
  botProfileRouter = new Router10;
  botProfileEngine = new profileUpload_default({
    maxFileSize: global.fileConfig.maxBotProfileFileSize,
    allowedFileTypes: ["image/png", "image/jpeg", "image/jpg", "image/gif"],
    uploadDir: UPLOAD_DIR,
    routePath: "/upload",
    fileNameGenerator: (req) => req.headers.id,
    permissionCheck: async (req) => {
      const botId = req.headers.id;
      if (!validData_default.id(botId)) {
        throw new Error("botId is missing or invalid");
      }
      const userId = req.user;
      const suser = {
        _id: userId,
        name: undefined,
        email: undefined
      };
      return await canUserEditBot(suser, botId);
    },
    postProcessCallback: async (filePath, req) => {
      await dataBase_default.botData.c(req.headers.id).updateOneOrAdd({ _id: "img" }, {});
    }
  });
  botProfileRouter.use(botProfileEngine.getRouter());
});

// back/http/api/file/emoji.ts
import { genId as genId7 } from "@wxn0brp/db";
import { Router as Router11 } from "@wxn0brp/falcon-frame";
import { existsSync as existsSync2, mkdirSync } from "fs";
import { Image as Image2 } from "image-js";
import multer2, { memoryStorage as memoryStorage2, MulterError } from "multer";
import { join as join2 } from "path";
async function checkUserPermission(userId, realm) {
  const permSys = new PermissionSystem(realm);
  const userPerm = await permSys.canUserPerformAnyAction(userId, [
    permission_default.admin,
    permission_default.manageEmojis
  ]);
  return userPerm;
}
var emojiRouter, baseRealmPath = "userFiles/realms", formats, storage, upload;
var init_emoji = __esm(async () => {
  init_codes();
  init_permission();
  init_validData();
  await __promiseAll([
    init_dataBase(),
    init_permission_system(),
    init_auth2()
  ]);
  emojiRouter = new Router11;
  formats = ["image/png", "image/jpeg", "image/jpg", "image/gif"];
  storage = memoryStorage2();
  upload = multer2({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file2, cb) => {
      if (!formats.includes(file2.mimetype)) {
        return cb(new MulterError("LIMIT_UNEXPECTED_FILE"), false);
      }
      cb(null, true);
    }
  }).single("file");
  emojiRouter.post("/emoji/upload", authenticateMiddleware, async (req, res) => {
    const userId = req.user;
    const realm = req.headers.realm;
    if (!validData_default.id(realm))
      return res.status(400).json({
        err: true,
        c: codes_default.UserError.Express.MissingParameters,
        msg: "realm"
      });
    try {
      const userPerm = await checkUserPermission(userId, realm);
      if (!userPerm)
        return res.status(403).json({
          err: true,
          c: codes_default.UserError.Express.EmojiUpload_NoPermissions,
          msg: "You do not have permission to do that."
        });
    } catch (err) {
      return res.status(500).json({
        err: true,
        c: codes_default.ServerError.Express.UploadError,
        msg: "Permission error."
      });
    }
    const emojisCount = await dataBase_default.realmConf.c(realm).find({
      $exists: { emoji: true }
    });
    if (emojisCount.length >= 100)
      return res.status(400).json({
        err: true,
        c: codes_default.UserError.Express.EmojiUpload_Limit,
        msg: "You can't upload more than 100 emojis."
      });
    const basePath = join2(baseRealmPath, realm, "emojis");
    if (!existsSync2(basePath)) {
      mkdirSync(basePath, { recursive: true });
    }
    upload(req, res, async (err) => {
      if (err) {
        return res.status(400).json({
          err: true,
          c: codes_default.UserError.Express.UploadError,
          msg: err.message
        });
      }
      const file2 = req.file;
      if (!file2) {
        return res.status(400).json({
          err: true,
          c: codes_default.UserError.Express.FileUpload_NoFile,
          msg: "No file uploaded."
        });
      }
      const newEmoji = {
        name: genId7(),
        emoji: genId7()
      };
      const filePath = join2(basePath, `${newEmoji.emoji}.png`);
      try {
        const image = await Image2.load(file2.buffer);
        await image.save(filePath, { format: "png" });
      } catch (error) {
        res.status(500).json({
          err: true,
          c: codes_default.ServerError.Express.UploadError,
          msg: "An error occurred while processing the file."
        });
        return;
      }
      await dataBase_default.realmConf.c(realm).add(newEmoji, false);
      res.json({ err: false, msg: "Emoji uploaded successfully." });
    });
  });
});

// back/http/api/file/realmProfile.ts
import { Router as Router12 } from "@wxn0brp/falcon-frame";
var realmProfileRouter, UPLOAD_DIR2 = "userFiles/realms", realmProfileEngine, realmImageGetterRouter;
var init_realmProfile = __esm(async () => {
  init_codes();
  init_permission();
  init_validData();
  await __promiseAll([
    init_dataBase(),
    init_permission_system(),
    init_profileUpload(),
    init_socket()
  ]);
  realmProfileRouter = new Router12;
  realmProfileEngine = new profileUpload_default({
    maxFileSize: global.fileConfig.maxRealmProfileFileSize,
    allowedFileTypes: ["image/png", "image/jpeg", "image/jpg", "image/gif"],
    uploadDir: UPLOAD_DIR2,
    routePath: "/profile/upload",
    permissionCheckError: codes_default.UserError.Express.RealmProfileUpload_NoPermissions,
    fileNameGenerator: (req) => req.headers.realm,
    permissionCheck: async (req) => {
      const realmId = req.headers.realm;
      if (!validData_default.id(realmId)) {
        throw new Error("realmId is missing or invalid");
      }
      const permSys = new PermissionSystem(realmId);
      const userId = req.user;
      return await permSys.canUserPerformAction(userId, permission_default.admin);
    },
    postProcessCallback: async (filePath, req) => {
      const realmId = req.headers.realm;
      await dataBase_default.realmConf.c(realmId).updateOne({ _id: "set" }, { img: true });
      sendToRealmUsers(realmId, "refreshData", "realm.get");
    }
  });
  realmImageGetterRouter = realmProfileEngine.createImageGetter("/img", UPLOAD_DIR2, "front/static/defaultProfile.png");
  realmProfileRouter.use(realmProfileEngine.getRouter());
  realmProfileRouter.use(realmImageGetterRouter);
});

// back/http/api/file/uploadFile.ts
import { Router as Router13 } from "@wxn0brp/falcon-frame";
import multer3, { diskStorage, MulterError as MulterError2 } from "multer";
import { existsSync as existsSync3, readdirSync, mkdirSync as mkdirSync2 } from "fs";
import { join as join3 } from "path";
import { genId as genId8 } from "@wxn0brp/db";
function separateFileName(name) {
  return name.replace(/[^a-zA-Z0-9.]/g, "_");
}
var maxUserFiles, maxUserFileSize, fileUploadRouter, uploadDir = "userFiles/users", limitUploads = (req, res, next) => {
  const userDir = join3(uploadDir, req.user);
  if (existsSync3(userDir)) {
    const files = readdirSync(userDir);
    if (files.length >= maxUserFiles) {
      return res.status(400).json({
        err: true,
        c: codes_default.UserError.Express.UserFile_FilesLimit,
        msg: "File upload limit exceeded. Maximum " + maxUserFiles + " files allowed.",
        data: maxUserFileSize
      });
    }
  }
  next();
}, storage2, upload2;
var init_uploadFile = __esm(async () => {
  init_codes();
  await init_auth2();
  ({ maxUserFiles, maxUserFileSize } = global.fileConfig);
  fileUploadRouter = new Router13;
  storage2 = diskStorage({
    destination: (req, file2, cb) => {
      const userDir = join3(uploadDir, req.user);
      if (!existsSync3(userDir)) {
        mkdirSync2(userDir, { recursive: true });
      }
      cb(null, userDir);
    },
    filename: (req, file2, cb) => {
      const genIdValue = genId8();
      const newFilename = `${genIdValue}-${separateFileName(file2.originalname)}`;
      cb(null, newFilename);
    }
  });
  upload2 = multer3({
    storage: storage2,
    limits: { fileSize: maxUserFileSize }
  }).single("file");
  fileUploadRouter.post("/file/upload", authenticateMiddleware, limitUploads, (req, res) => {
    upload2(req, res, (err) => {
      if (err) {
        if (err instanceof MulterError2 && err.code === "LIMIT_FILE_SIZE") {
          return res.status(400).json({
            err: true,
            c: codes_default.UserError.Express.UserFile_SizeLimit,
            msg: "File size exceeds " + maxUserFileSize / 1024 / 1024 + "MB limit.",
            data: maxUserFileSize
          });
        }
        return res.status(500).json({
          err: true,
          c: codes_default.ServerError.Express.UploadError,
          msg: "An error occurred during the file upload."
        });
      }
      const file2 = req.file;
      const filePath = "/" + join3(file2.destination, file2.filename);
      res.json({
        err: false,
        msg: "File uploaded successfully.",
        path: filePath
      });
    });
  });
});

// back/http/api/file/userProfile.ts
import { Router as Router14 } from "@wxn0brp/falcon-frame";
var userProfileRouter, UPLOAD_DIR3 = "userFiles/profiles", userProfileEngine, imageGetterRouter;
var init_userProfile = __esm(async () => {
  await init_profileUpload();
  userProfileRouter = new Router14;
  userProfileEngine = new profileUpload_default({
    maxFileSize: global.fileConfig.maxUserProfileFileSize,
    allowedFileTypes: ["image/png", "image/jpeg", "image/jpg", "image/gif"],
    uploadDir: UPLOAD_DIR3,
    routePath: "/upload",
    fileNameGenerator: (req) => req.user
  });
  imageGetterRouter = userProfileEngine.createImageGetter("/img", UPLOAD_DIR3, "front/static/defaultProfile.png");
  userProfileRouter.use(userProfileEngine.getRouter());
  userProfileRouter.use(imageGetterRouter);
});

// back/http/api/id/botId.ts
var botIdRoute = async (req, res) => {
  const { id, chat } = req.query;
  if (!validData_default.id(id))
    return res.json({
      err: true,
      c: codes_default.UserError.Express.MissingParameters,
      msg: "bot"
    });
  if (chat && !validData_default.id(chat))
    return res.json({
      err: true,
      c: codes_default.UserError.Express.MissingParameters,
      msg: "chat"
    });
  if (chat) {
    const botNick = await dataBase_default.realmData.c(chat).findOne({ bid: id });
    if (botNick)
      return res.json({ err: false, name: botNick.name });
  }
  const bot = await dataBase_default.botData.c(id).findOne({ _id: "name" });
  if (!bot) {
    const rm2 = await dataBase_default.data.c("rm").findOne({ _id: id });
    if (rm2)
      return res.json({ err: false, name: "Deleted Bot " + id });
    return res.json({
      err: true,
      c: codes_default.UserError.Express.BotId_BotNotFound,
      msg: "bot is not found"
    });
  }
  res.json({ err: false, name: bot.name });
};
var init_botId = __esm(async () => {
  init_codes();
  init_validData();
  await init_dataBase();
});

// back/http/api/id/chatId.ts
var chatIdRoute = async (req, res) => {
  const { chat } = req.query;
  if (!chat)
    return res.json({
      err: true,
      c: codes_default.UserError.Express.MissingParameters,
      msg: "chat"
    });
  const chatI = await dataBase_default.realmConf.c(chat).findOne({ _id: "set" });
  if (!chatI) {
    const rm2 = await dataBase_default.data.c("rm").findOne({ _id: chat });
    if (rm2)
      return res.json({ err: false, name: "Deleted Chat " + chat });
    return res.json({
      err: true,
      c: codes_default.UserError.Express.ChatId_NotFound,
      msg: "chatId is not found"
    });
  }
  res.json({ err: false, name: chatI.name });
};
var init_chatId = __esm(async () => {
  init_codes();
  await init_dataBase();
});

// back/http/api/id/eventId.ts
import { AnotherCache as AnotherCache9 } from "@wxn0brp/ac";
var cache6, eventIdRoute = async (req, res) => {
  const { id } = req.query;
  if (!validData_default.id(id))
    return res.json({
      err: true,
      c: codes_default.UserError.Express.MissingParameters,
      msg: "event"
    });
  let name = cache6.get(id);
  if (!name) {
    const data = await dataBase_default.realmData.c("announcement.channels").findOne((data2, ctx) => {
      const { tr, tc } = data2;
      return ctx.combineId(tr, tc) == ctx.id;
    }, {}, { id, combineId });
    if (!data)
      return res.json({
        err: true,
        c: codes_default.UserError.Express.EventId_NotFound,
        msg: "event not found"
      });
    const chnl = await dataBase_default.realmConf.c(data.tr).findOne({ chid: data.tc });
    if (!chnl)
      return res.json({
        err: true,
        c: codes_default.UserError.Express.EventId_NotFound,
        msg: "event not found"
      });
    const realmName = await dataBase_default.realmConf.c(data.tr).findOne({ _id: "set" }).then(({ name: name2 }) => name2);
    name = realmName + " > " + chnl.name;
    cache6.set(id, name);
  }
  res.json({ err: false, name });
};
var init_eventId = __esm(async () => {
  init_codes();
  init_validData();
  await __promiseAll([
    init_dataBase(),
    init_cacheSettings(),
    init_chatMgmt()
  ]);
  cache6 = new AnotherCache9(getCacheSettings("EventId"));
});

// back/http/api/id/userId.ts
var userIdRoute = async (req, res) => {
  const { id, chat } = req.query;
  if (!validData_default.id(id))
    return res.json({
      err: true,
      c: codes_default.UserError.Express.MissingParameters,
      msg: "id"
    });
  if (chat && !validData_default.id(chat))
    return res.json({
      err: true,
      c: codes_default.UserError.Express.MissingParameters,
      msg: "chat"
    });
  if (chat) {
    const userData = await dataBase_default.realmData.c(chat).findOne({ uid: id });
    if (userData)
      return res.json({ err: false, name: userData.name, c: 1 });
  }
  const user = await dataBase_default.data.c("user").findOne({ _id: id });
  if (!user) {
    const rm2 = await dataBase_default.data.c("rm").findOne({ _id: id });
    if (rm2)
      return res.json({ err: false, name: "Deleted User " + id, c: -1 });
    return res.json({
      err: true,
      c: codes_default.UserError.Express.UserId_NotFound,
      msg: "user is not found"
    });
  }
  const nickData = await dataBase_default.userData.c(id).findOne({
    $exists: { nick: true }
  });
  if (nickData)
    return res.json({ err: false, name: nickData.nick, c: 0 });
  return res.json({ err: false, name: user.name, c: 0 });
};
var init_userId = __esm(async () => {
  init_codes();
  init_validData();
  await init_dataBase();
});

// back/http/api/id/webhookId.ts
var webhookIdRoute = async (req, res) => {
  const { id, chat } = req.query;
  if (!validData_default.id(id))
    return res.json({
      err: true,
      c: codes_default.UserError.Express.MissingParameters,
      msg: "id"
    });
  if (chat && !validData_default.id(chat))
    return res.json({
      err: true,
      c: codes_default.UserError.Express.MissingParameters,
      msg: "chat"
    });
  const webhook = await dataBase_default.realmConf.c(chat).findOne({ whid: id });
  if (!webhook) {
    const rm2 = await dataBase_default.data.c("rm").findOne({ _id: id });
    if (rm2)
      return res.json({ err: false, name: "Deleted Webhook " + id });
    return res.json({
      err: true,
      c: codes_default.UserError.Express.WebhookId_NotFound,
      msg: "webhook is not found"
    });
  }
  res.json({ err: false, name: webhook.name });
};
var init_webhookId = __esm(async () => {
  init_codes();
  init_validData();
  await init_dataBase();
});

// back/http/api/id/index.ts
import { Router as Router15 } from "@wxn0brp/falcon-frame";
var idRouter;
var init_id = __esm(async () => {
  await __promiseAll([
    init_botId(),
    init_chatId(),
    init_eventId(),
    init_userId(),
    init_webhookId()
  ]);
  idRouter = new Router15;
  idRouter.get("/bot", botIdRoute);
  idRouter.get("/chat", chatIdRoute);
  idRouter.get("/event", eventIdRoute);
  idRouter.get("/u", userIdRoute);
  idRouter.get("/wh", webhookIdRoute);
});

// back/http/api/index.ts
import { Router as Router16 } from "@wxn0brp/falcon-frame";
var apiRouter;
var init_api = __esm(async () => {
  await __promiseAll([
    init_deleteAccount3(),
    init_login(),
    init_register4(),
    init_announcement(),
    init_botInvite(),
    init_fireToken(),
    init_realmJoin(),
    init_webhook(),
    init_botProfile(),
    init_emoji(),
    init_realmProfile(),
    init_uploadFile(),
    init_userProfile(),
    init_id()
  ]);
  apiRouter = new Router16;
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
  apiRouter.use("/iv/bot", botInvite_default);
  apiRouter.use("/", fireTokenRouter);
  apiRouter.use("/realm/join", realmJoinRouter);
  apiRouter.use("/", webhookRouter);
});

// back/http/route.ts
import { Router as Router17 } from "@wxn0brp/falcon-frame";
function renderCards() {
  return cards.map((card) => `<li class="link-card">
			<span>
				<h2>
					<span>&rarr;</span>
					${card.title}
				</h2>
				<p>
					${card.body}
				</p>
			</span>
		</li>`).join("");
}
var frontRouter, cards, pages;
var init_route = __esm(() => {
  frontRouter = new Router17;
  cards = [
    { title: "Easy to Use", body: "Simple interface, easy to navigate." },
    { title: "Customizable Themes", body: "Personalize the look according to preferences." },
    { title: "Community and Support", body: "Support from the community and team." },
    { title: "Updates and Information", body: "Receive the latest updates." },
    { title: "Privacy and Security", body: "Strong encryption for your privacy." },
    { title: "Multi-platform Versions", body: "Available on various devices." },
    { title: "User Management", body: "Easy community management." },
    { title: "Starter Kits", body: "Quick start with starter kits." }
  ];
  pages = {
    "rm/account-confirm": {
      title: "Fusion Chat | Confirm delete your account"
    },
    "rm/account-undo": {
      title: "Fusion Chat | Undo delete your account"
    },
    "iv/bot": {
      title: "Fusion Chat | Invite bot"
    },
    "404": {
      title: "Fusion Chat | 404 Page Not Found"
    },
    announcement: {
      title: "Fusion Chat | Announcement"
    },
    get: {
      title: "Download Fusion Chat",
      description: "Download Fusion Chat for free"
    },
    index: {
      title: "Welcome to Fusion Chat",
      description: "Fusion Chat is a free, open source, and privacy-friendly chat application.",
      cards: renderCards()
    },
    ir: {
      title: "Fusion Chat | Join To realm"
    },
    login: {
      title: "Login to Fusion Chat"
    },
    "qr-code-login": {
      title: "Fusion Chat | Login by QR Code"
    },
    "register-code": {
      title: "Fusion Chat | Register"
    },
    register: {
      title: "Fusion Chat | Register"
    },
    tos: {
      title: "Fusion Chat | Terms of Service"
    }
  };
  frontRouter.get("/app", (req, res) => res.render("app/app.html", {}, { baseDir: "front" }));
  frontRouter.get("/dev-panel", (req, res) => res.render("public/dev-panel.html"));
  frontRouter.static("/", "front/main", {
    renderData: pages
  });
});

// back/http/index.ts
import { FalconFrame } from "@wxn0brp/falcon-frame";
import crypto2 from "crypto";
var app;
var init_http = __esm(async () => {
  init_bannedIp();
  init_route();
  await init_api();
  app = new FalconFrame;
  app.use(expressMiddleware);
  app.setOrigin("*");
  app.static("front/static");
  if (process.env.IS_TECHNICAL_BREAK == "true") {
    app.use((req, res) => {
      res.status(503).send(`
            <link rel="stylesheet" href="/style.css"></link>
            <link rel="shortcut icon" href="/favicon.svg" type="image/x-icon">
            <title>Fusion Chat</title>
            <br />
            <h1>Sorry! Server go to chase squirrels. Be back soon, hopefully with better speed!</h1>
        `.trim());
    });
  }
  app.static("/", "front/public");
  app.static("/assets", "front/assets");
  app.static("/", "front/css");
  app.static("/lang", "front/lang");
  app.static("/app", "front/app");
  app.static("/app/js", "front-app/dist");
  app.static("/dev-panel", "front/dev-panel");
  app.static("/meta", "front/meta");
  app.static("/userFiles", "userFiles");
  app.static("/app/src", "front-app/src", { errorIfDirNotFound: false });
  app.static("/js", "front-scripts/dist");
  global.sessions = {};
  app.use((req, res, next) => {
    const sessionId = req.cookies.session;
    let session = global.sessions[sessionId];
    if (!session) {
      const id = crypto2.randomBytes(64).toString("hex");
      res.cookie("session", id, { sameSite: "Strict" });
      session = global.sessions[id] = {};
    }
    req.session = session;
    next();
  });
  app.use("/", frontRouter);
  app.use("/api", apiRouter);
});

// back/index.ts
var exports_back = {};
import http from "http";
var server;
var init_back = __esm(async () => {
  init_server();
  await __promiseAll([
    init_schedule(),
    init_http(),
    init_socket()
  ]);
  Error.stackTraceLimit = 100;
  app.setVar("layout", "front/main/layout.html");
  server = http.createServer(app.getApp());
  io.attachToHttpServer(server);
  lo("__________________" + (new Date + "").split(" ").slice(1, 5).join(" "));
  server.listen(parseInt(process.env.PORT), function() {
    if (true) {
      lo("Server started by developer mode");
      lo("http://localhost:" + process.env.PORT + "/app");
    }
  });
  loadTasks();
  io.falconFrame(app);
  app.set404((req, res) => {
    res.render("front/main/404", {
      title: "Fusion Chat | Page Not Found"
    });
  });
});

// back/app.ts
import sourceMapSupport from "source-map-support";
import { configDotenv } from "dotenv";
await Promise.resolve().then(() => (init_setUp(), exports_setUp));
configDotenv({ quiet: true });
await Promise.resolve().then(() => (init_env(), exports_env));
sourceMapSupport.install();
global.dir = "file://" + process.cwd() + "/";
await init_global().then(() => exports_global);
await init_dataBase().then(() => exports_dataBase);
await init_firebase().then(() => exports_firebase);
await init_logs().then(() => exports_logs);
await init_back().then(() => exports_back);

//# debugId=986EEEFA273D67F364756E2164756E21
