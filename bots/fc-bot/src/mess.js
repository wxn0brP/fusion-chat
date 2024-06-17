class Mess{
    constructor(client, mess){
        this.client = client;
        Object.assign(this, mess);
    }

    reply(txt){
        this.client.socket.emit("mess", {
            to: this.toM,
            msg: txt,
            chnl: this.chnl,
            res: this._id
        })
    }
}

module.exports = Mess;