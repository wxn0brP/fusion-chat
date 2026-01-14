
import pkg from "./package.json" assert { type: "json" };

const externals = [
    ...Object.keys(pkg.dependencies ?? {}),
    "#runtime/*",
];

await Bun.build({
    entrypoints: ["back/app.ts", "back/setUp.ts"],
    target: "node",
    outdir: "dist-back",
    sourcemap: "external",
    external: externals,
});

const configBaseGlob = new Bun.Glob("back/config-base/*");
const configBaseEntries: string[] = [];

for await (const file of configBaseGlob.scan()) {
    configBaseEntries.push(file);
}

await Bun.build({
    entrypoints: configBaseEntries,
    outdir: "dist-back/config-base",
});

export { }