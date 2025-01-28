export enum InternalCodeCategory {
    Info = 1,
    Success = 2,
    RedirectOrWaiting = 3,
    UserError = 4,
    ServerError = 5,
}

export enum InternalCodeSubcategory {
    General = 0,
    Socket = 1,
    Express = 2,
}