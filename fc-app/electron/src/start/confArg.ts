import { Command } from "commander";
import vars, { Vars } from "../vars";
import { app } from "electron";

const program = new Command();

program
    .name("fusion-chat")
    .version(app.getVersion(), "-v, --version", "display version")
    .option("-d, --dev", "Start in development mode")
    .option("-l, --link <url>", "Link to the server", "https://fusion.ct8.pl")
    .option("--rpc-port <port>", "RPC server port", "58888")
    .action(() => {
        const options = program.opts();
        const port = parseInt(options["rpcPort"]) || 58888;
        if (port < 1024 || port > 65535) {
            console.error("RPC port must be between 1024 and 65535");
            process.exit(1);
        }
    });

program.parse(process.argv);

vars.confArg = program.opts() as Vars["confArg"];