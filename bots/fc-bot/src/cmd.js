import fs from "fs";

class CommandEngine{
    constructor(enabled=true){
        this.prefix = "";
        this.enabled = enabled;
        this.commands = new Map();
        this.opts = {};
    }

    setPrefix(prefix){
        this.prefix = prefix;
    }

    async loadCommands(commandPath){
        const commandFiles = fs.readdirSync(commandPath);
        
        for(const file of commandFiles){
            const command = await import(commandPath + "/" + file);
            this.commands.set(command.name, command);
        }
    }

    findCommand(name){
        if(this.commands.has(name)) return this.commands.get(name);

        for(const command of this.commands.values()){
            if(command.alias.includes(name)) return command;
        }

        return null;
    }

    async handleInput(mess){
        if(!this.enabled) return { c: 1 };
        if(!this.opts.bot && mess.frMeta == "bot") return { c: 1 };
        if(!this.opts.webhook && mess.frMeta == "webhook") return { c: 1 };

        const input = mess.msg;
        if(!input.startsWith(this.prefix)) return { c: 1 };

        const args = input.slice(this.prefix.length).trim().split(/ +/);
        const commandName = args.shift().toLowerCase();
        const command = this.findCommand(commandName);

        if(!command) return { c: 1 };

        if(args.length < command.minArgs || 0) return {
            c: 2,
            msg: `Usage: ${this.prefix}${command.name} ${command.usage || "<args length: " + command.minArgs + ">"}`
        };
        
        try{
            const res = await command.execute(mess, args);
            return res ? { c: 2, msg: res } : { c: 0 };
        }catch(error){
            return { c: 1 };
        }
    }
}

export default CommandEngine;