const defaultTTL = 600;
const defaultCheckPeriod = 120;

export default {
    EventId: [defaultTTL, defaultCheckPeriod],
    UserOnRealm: [defaultTTL, defaultCheckPeriod],
    ChnlPermission: [defaultTTL, defaultCheckPeriod],
    ChnlPermission_Channels: [defaultTTL/2, defaultCheckPeriod/2],
    UserStatus: [2 * 60, 60],
    DmBlock: [defaultTTL, defaultCheckPeriod],
    UserDm: [defaultTTL, defaultCheckPeriod],
    AnnouncementSubscribe: [defaultTTL, defaultCheckPeriod],
}