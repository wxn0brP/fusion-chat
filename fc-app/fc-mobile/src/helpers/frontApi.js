import vars from "../vars";
import firebase from "../config/firebase";
import { NativeModules } from "react-native";
import AudioRecorder from "../modules/audioRecorder";
import { startRecording } from "../components/voice";
import notificationModule from "../modules/notificationModule";

export const handleReceiveMessage = (event) => {
    let data = JSON.parse(event.nativeEvent.data);
    switch (data.type) {
        case "notif":
            notificationModule.showNotification(data.title, data.msg);
            break;
        case "fireToken":
            firebase.registerApp(data.fireToken);
            break;
        case "debug":
            console.log(data.msg);
            break;
        case "startAudio":
            startRecording();
            break;
        case "stopAudio":
            AudioRecorder.stop();
            break;
        case "openLinkSettings":
            NativeModules.DefaultLinkSettings.openAppLinkSettings();
            break;
        default:
            console.log("unknown message", data);
    }
}

export const sendToFront = (data) => {
    try {
        if (!vars?.webViewRef?.current) return console.error("no webview");
        data = JSON.stringify(data);
        data = "mglVar.apis.api.receiveMessage(`" + data + "`)";
        vars.webViewRef.current.injectJavaScript(data);
    } catch (e) {
        console.error(e);
    }
}
