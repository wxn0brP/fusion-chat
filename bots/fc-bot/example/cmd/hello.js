export const name = "hello";
export const alias = ["hi"];
export const minArgs = 1;
export const usage = "<name>";
export async function execute(mess, args){
    const [name] = args;
    mess.reply(`Hello, ${name}!`);
}