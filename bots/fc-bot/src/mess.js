class Mess{
    constructor(client, mess){
        this.client = client;
        Object.assign(this, mess);

        const fr = mess.fr;
        if(fr.startsWith("%")){
            this.frMeta = "webhook";
        }else
        if(fr.startsWith("^")){
            this.frMeta = "bot";
        }else{
            this.frMeta = "user";
        }
    }

    reply(txt){
        this.client.socket.emit("mess", {
            to: this.toM,
            msg: txt,
            chnl: this.chnl,
            res: this._id
        });
    }
}

export default Mess;