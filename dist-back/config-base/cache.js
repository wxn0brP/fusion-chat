// back/config-base/cache.ts
var defaultTTL = 600;
var defaultCheckPeriod = 120;
var cache_default = {
  EventId: [defaultTTL, defaultCheckPeriod],
  UserOnRealm: [defaultTTL, defaultCheckPeriod],
  ChnlPermission: [defaultTTL, defaultCheckPeriod],
  ChnlPermission_Channels: [defaultTTL / 2, defaultCheckPeriod / 2],
  UserStatus: [2 * 60, 60],
  DmBlock: [defaultTTL, defaultCheckPeriod],
  UserDm: [defaultTTL, defaultCheckPeriod],
  AnnouncementSubscribe: [defaultTTL, defaultCheckPeriod],
  BotEdit: [defaultTTL, defaultCheckPeriod]
};
export {
  cache_default as default
};
