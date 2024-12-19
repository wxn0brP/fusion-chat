export const send = (data) => {
    window.ReactNativeWebView.postMessage(JSON.stringify(data));
}

export const receiveMessage = (data) => {
    data = JSON.parse(data);
    switch(data.type){
        case "debug":
            debugFunc.msg(data.msg);
        break;
        case "close":
            socket.disconnect();
        break;
        case "unclose":
            socket.connect();
        break;
        case "ctrl":
            if(typeof data.ctrl == "object" && !Array.isArray(data.ctrl)) data.ctrl = [data.ctrl];
            const ctrl = data.ctrl.map(c => ({ type: c[0], value: c.slice(1) }));
            stateManager.handleArray(ctrl);
        break;
    }
}

const processMediaRN = {
    init(){
        this.audioContext = new AudioContext();
        this.destination = this.audioContext.createMediaStreamDestination();
        const track = this.destination.stream.getAudioTracks()[0];
        this.mediaStream = new MediaStream([track]);
    },

    base64ToArrayBuffer(base64){
        const binaryString = window.atob(base64);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        return bytes.buffer;
    },
    
    async handleAudioData(wavDataBuffer){
        try{
            const audioBuffer = await this.audioContext.decodeAudioData(wavDataBuffer);
            const source = this.audioContext.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(this.destination);
            source.start();
        }catch(error){
            debugFunc.msg('Error processing audio data: ' + error);
        }
    },

    async getStream(){
        apis.api.send({
            type: "startAudio",
        });

        await delay(1000);
        return this.mediaStream;
    }
};

apis.api.receiveAudio = async (base64WavData) => {
    const wavDataBuffer = processMediaRN.base64ToArrayBuffer(base64WavData);
    processMediaRN.handleAudioData(wavDataBuffer);
};

setTimeout(() => {
    try{
        processMediaRN.init();
    }catch(error){
        debugFunc.msg(error);
    }
}, 1000);

setTimeout(() => {
    socket.emit("fireToken.get", (token) => {
        apis.api.send({
            type: "fireToken",
            fireToken: token,
        });
    })
}, 5000);