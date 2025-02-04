const InternalCode = {
    Info: {
        General: {

        },
        Socket: {


        },
        Express: {

        }
    },
    Success: {
        General: {

        },
        Socket: {

        },
        Express: {

        }
    },
    RedirectOrWaiting: {
        General: {

        },
        Socket: {

        },
        Express: {

        }
    },
    UserError: {
        General: {

        },
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
            RealmThreadList_NotAuthorized: "41.041",
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
            InviteBot_NotPermission: "42.038",
        }
    },
    ServerError: {
        General: {

        },
        Socket: {
            OgEmbed_ErrorFetching: "51.001",
            RealmSettingsSet_Failed: "51.002",
        },
        Express: {
            AuthError: "52.001",
            Register_FailedToSendEmail: "52.002",
            RegisterVerify_FailedToRegisterUser: "52.003",
            UploadError: "52.004",
        }
    }
}

export default InternalCode;