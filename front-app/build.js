import esbuild from "esbuild";

esbuild.build({
    entryPoints: ["src/startApp.ts"],
    outdir: "dist",
    bundle: true,
    format: "esm",
    platform: "browser",
    target: "es2022",
    sourcemap: true,
    minify: false,
    treeShaking: true,
    splitting: false,
    keepNames: true,
    tsconfig: "tsconfig.json",
    loader: { ".ts": "ts" },
    logLevel: "info",
    external: [
        "../../dist/lang/*"
    ]
}).catch(() => process.exit(1));
