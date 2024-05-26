import React, { useEffect } from 'react';
import { AppState } from 'react-native';
import { WebView } from 'react-native-webview';
import NotificationModule from './NotificationModule';
import messaging from '@react-native-firebase/messaging';
import axios from "axios";
import updateFunc from "./update";
import config from "./config";

const lo = console.log;
const url = config.link;

const ReactNativeApp = () => {
    const webViewRef = React.useRef(null);
    var webviewUrl = "";

    const requestUserPermission = async () => {
        const authStatus = await messaging().requestPermission();
        const enabled =
            authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
            authStatus === messaging.AuthorizationStatus.PROVISIONAL;
      
        if(enabled) console.log('Authorization Firebase status:', authStatus);
    }

    const registerApp = async (id, user) => {
        const token = await messaging().getToken();
        const res = await axios.post(url+"/notif-reg", {
            token,
            id,
            user
        });
        console.log("res token add", res.data);
    }

    const handleReceiveMessage = (event) => {
        let data = JSON.parse(event.nativeEvent.data);
        switch(data.type){
            case "notif":
                handleSendNotif(data)
            break;
            case "firebase":
                registerApp(data._id, data.user);
            break;
            case "debug":
                console.log(data.msg);
            break;
        }
    }

    const sendToFront = (data) => {
        try{
            if(!webViewRef.current) return;
            webViewRef.current.injectJavaScript(`apis.api.receiveMessage('${JSON.stringify(data)}')`)
        }catch(e){
            console.log(e);
        }
    }
    
    const handleSendNotif = (data) => {
        NotificationModule.showNotification(data.title, data.msg);
    }

    useEffect(() => {
        const handleAppStateChange = (nextAppState) => {
            if(nextAppState !== 'background'){
                sendToFront({ type: "unclose" });
                return;
            }
            if(webviewUrl.endsWith('/app/')){
                sendToFront({ type: "close" });
            }
        };
        AppState.addEventListener('change', handleAppStateChange);
    }, []);

    useEffect(() => {
        requestUserPermission();
    }, []);

    (async () => {
        await NotificationModule.checkApplicationPermission();
        NotificationModule.initNotifications();
        
        console.log("Checking for updates...");
        const update = await updateFunc();
        if(update){
            console.log("Update available");
            NotificationModule.showNotification("Update Required", "Please update the app", "updateCall");
        }
    })();

    return (
        <WebView
            source={{ uri: url+'/app' }}
            onMessage={e => handleReceiveMessage(e)}
            onNavigationStateChange={(navState) => {
                webviewUrl = navState.url;
            }}
            ref={webViewRef}
        />
    );
}

export default ReactNativeApp;
