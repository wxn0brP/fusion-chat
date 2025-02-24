declare global {
    var lo: typeof console.log;
    var delay: (ms: number) => Promise<void>;

    var fileConfig: {
        maxUserProfileFileSize: number;
        maxUserFileSize: number;
        maxUserFiles: number;
        maxRealmProfileFileSize: number;
        maxBotProfileFileSize: number;
    };

    var logsConfig: {
        level: string;
        mail: {
            loginWarn: boolean;
            deletedAccount: boolean;
        }
    };
}

export {}