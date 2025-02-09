import LangPkg from "./translate.js";
export var InternalCodeCategory;
(function (InternalCodeCategory) {
    InternalCodeCategory[InternalCodeCategory["Info"] = 1] = "Info";
    InternalCodeCategory[InternalCodeCategory["Success"] = 2] = "Success";
    InternalCodeCategory[InternalCodeCategory["RedirectOrWaiting"] = 3] = "RedirectOrWaiting";
    InternalCodeCategory[InternalCodeCategory["UserError"] = 4] = "UserError";
    InternalCodeCategory[InternalCodeCategory["ServerError"] = 5] = "ServerError";
})(InternalCodeCategory || (InternalCodeCategory = {}));
export var InternalCodeSubcategory;
(function (InternalCodeSubcategory) {
    InternalCodeSubcategory[InternalCodeSubcategory["General"] = 0] = "General";
    InternalCodeSubcategory[InternalCodeSubcategory["Socket"] = 1] = "Socket";
    InternalCodeSubcategory[InternalCodeSubcategory["Express"] = 2] = "Express";
})(InternalCodeSubcategory || (InternalCodeSubcategory = {}));
function changeCodeToString(code) {
    const category = InternalCodeCategory[code[0]];
    const subcategory = InternalCodeSubcategory[code[1]];
    return LangPkg.InternalCode[category][subcategory][code] || code;
}
export default changeCodeToString;
//# sourceMappingURL=code.js.map