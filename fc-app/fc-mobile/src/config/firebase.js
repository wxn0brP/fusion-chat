import messaging from "@react-native-firebase/messaging";
import axios from "axios";
import config from "./config";

const registerApp = async (pointerToken) => {
    try{
        const fireToken = await messaging().getToken();
        const res = await axios.post(config.link+"/api/fireToken", {
            fireToken,
            fcToken: pointerToken,
        });
        console.log("res token add. `err`:", res.data.err, "`msg:`", res.data.msg);
    }catch(e){
        console.error("error token add:", e.message);
    }
}

const initFbCallbacks = (handleNotificationAction) => {
    let notificationHandled = false;

    const handleNotification = (remoteMessage) => {
        if(notificationHandled) return;
        notificationHandled = true;

        if(remoteMessage?.data?.action){
            handleNotificationAction(JSON.parse(remoteMessage.data.action));
        }

        setTimeout(() => (notificationHandled = false), 5000);
    };

    const unsubscribeOnMessage = messaging().onMessage(async (remoteMessage) => {
        handleNotification(remoteMessage);
    });

    messaging().setBackgroundMessageHandler(async (remoteMessage) => {
        handleNotification(remoteMessage);
    });

    const unsubscribeNotificationOpenedApp = messaging().onNotificationOpenedApp((remoteMessage) => {
        handleNotification(remoteMessage);
    });

    messaging().getInitialNotification().then((remoteMessage) => {
        if(remoteMessage){
            handleNotification(remoteMessage);
        }
    });

    return () => {
        unsubscribeOnMessage();
        unsubscribeNotificationOpenedApp();
    };
}

export default {
    registerApp,
    initFbCallbacks
}