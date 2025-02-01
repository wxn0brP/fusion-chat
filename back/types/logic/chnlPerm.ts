namespace Logic_ChnlPerm {
    export interface Permissions {
        [role: string]: number; // Role-to-permission mapping
    }

    export interface ChannelPermissions {
        [chid: string]: Permissions | "non-defined"; // Channel ID to permissions mapping
    }
}

export default Logic_ChnlPerm;