import messaging from '@react-native-firebase/messaging';
import { PermissionsAndroid } from 'react-native';

const requestUserPermission = async () => {
    const authStatus = await messaging().requestPermission();
    console.log('Authorization Firebase status:', authStatus);
}

const requestMicrophonePermission = async () => {
    const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        {
            title: "Microphone Permission",
            message: "Fusion Chat needs access to your microphone",
            buttonNeutral: "Ask Me Later",
            buttonNegative: "Cancel",
            buttonPositive: "OK"
        }
    );
    if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log("You can use the microphone");
    } else {
        console.log("Microphone permission denied");
    }
}

export default {
    requestUserPermission,
    requestMicrophonePermission
}