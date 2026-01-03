export async function loadConfig(name: string, def = true) {
    const mod = await import("../config/" + name + ".js");
    if (def) return mod.default;
    return mod;
}