apis.api.send = (data) => {
    window.ReactNativeWebView.postMessage(JSON.stringify(data));
}

apis.api.receiveMessage = (data) => {
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
    apis.api.send({
        type: "firebase",
        _id: vars.user._id,
        user: vars.user.fr,
    });
    try{
        processMediaRN.init();
    }catch(error){
        debugFunc.msg(error);
    }
}, 1000);

// setTimeout(() => {
//     apis.api.send({
//         type: "notif",
//         msg: "test",
//         title: "test",
//     });
// }, 5000);