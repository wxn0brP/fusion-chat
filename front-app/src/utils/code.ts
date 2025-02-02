import LangPkg from "./translate";

export enum InternalCodeCategory {
    Info = 1,
    Success = 2,
    RedirectOrWaiting = 3,
    UserError = 4,
    ServerError = 5,
}

export enum InternalCodeSubcategory {
    General,
    Socket,
    Express,
}

function changeCodeToString(code: string): string {
    const category = InternalCodeCategory[code[0]];
    const subcategory = InternalCodeSubcategory[code[1]];

    return LangPkg.InternalCode[category][subcategory][code] || code;
}

export default changeCodeToString;