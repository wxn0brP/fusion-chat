import { NativeEventEmitter, NativeModules } from "react-native";
const { AudioModule } = NativeModules;
const audioEvents = new NativeEventEmitter(AudioModule);

class AudioRecorder {
    start(cb) {
        console.log("AudioRecorder start", cb);
        if (!cb || !AudioModule) return;
        AudioModule.startRecording();

        this.subscription = audioEvents.addListener("AudioData", cb);
    }

    stop() {
        if (AudioModule) {
            AudioModule.stopRecording();
        }
        if (this.subscription) {
            this.subscription.remove();
        }
    }
}

export default new AudioRecorder();
