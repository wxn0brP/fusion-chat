import { Command } from "commander";
import vars, { Vars } from "../vars";
import { app } from "electron";

interface ProgramOptions {
    dev?: boolean;
    link?: string;
    rpcPort?: string;
}

type VarsConfArg = Vars["confArg"];

const program = new Command();

program
    .name("fusion-chat")
    .version(app.getVersion(), "-v, --version", "display version")
    .option("-d, --dev", "Start in development mode")
    .option("-l, --link <url>", "Link to the server", "https://fusion.ct8.pl")
    .option("--rpcPort <port>", "RPC server port", "58888")
    .action(() => {
        const options = program.opts<ProgramOptions>();
        const port = parseInt(options.rpcPort || "58888", 10);

        if (isNaN(port) || port < 1024 || port > 65535) {
            console.error("RPC port must be between 1024 and 65535");
            process.exit(1);
        }

        const args: Partial<VarsConfArg> = {
            dev: options?.dev,
            link: options?.link,
            rpcPort: port
        };

        vars.confArg = Object.assign(vars.confArg || {}, args) as VarsConfArg;
    });

program.parse();