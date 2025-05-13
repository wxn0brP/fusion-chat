await import("./init");
await import("#core/store");
await import("#socket/evt");

await import("./init/components");
await import("./init/actions");
await import("./init/modals");

await (await import("#utils/translate")).init_translate();
await import("./init/app");
await import("./init/start");

export {}
