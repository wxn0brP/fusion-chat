import AudioRecorder from "../modules/audioRecorder";
import permission from "../helpers/permission";
import vars from "../vars";

export const startRecording = async () => {
    await permission.requestMicrophonePermission();
    AudioRecorder.start((data) => {
        if (!vars?.webViewRef?.current) return;
        vars.webViewRef.current.injectJavaScript(`mglVar.apis.api.receiveAudio("${data}")`)
    });
}