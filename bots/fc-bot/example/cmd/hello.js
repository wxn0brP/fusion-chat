module.exports = {
    name: "hello",
    alias: ["hi"],
    minArgs: 1,
    usage: "<name>",
    async execute(mess, args){
        const [name] = args;
        mess.reply(`Hello, ${name}!`);
    }
}