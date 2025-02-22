#!/usr/bin/env node
/**
 * Example of config usage:
 * node build.js minify=false
 */
import esbuild from "esbuild";

const args = process.argv.slice(2);
const config = {};
for (const arg of args) {
    let [key, value] = arg.split("=");
    if(value == undefined) value = true;
    else if (value == "true" || value == "false") value = value == "true";
    else if (value.startsWith("{") && value.endsWith("}")) value = JSON.parse(value);
    config[key] = value;
}

esbuild.build({
    entryPoints: ["src/startApp.ts"],
    outdir: "dist",
    bundle: true,
    format: "esm",
    platform: "browser",
    target: "es2022",
    sourcemap: true,
    minify: true,
    treeShaking: true,
    splitting: false,
    keepNames: true,
    tsconfig: "tsconfig.json",
    loader: { ".ts": "ts" },
    logLevel: "info",
    external: [
        "../../dist/lang/*"
    ],
    ...config
}).catch(() => process.exit(1));
