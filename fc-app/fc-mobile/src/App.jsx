import React, { useEffect } from 'react';
import { AppState } from 'react-native';
import { WebView } from 'react-native-webview';
import notificationModule from './notificationModule';
import updateFunc from "./update";
import config from "./config";
import firebase from "./firebase";
import permission from "./permission";

const lo = console.log;

const ReactNativeApp = () => {
    const webViewRef = React.useRef(null);
    var webviewUrl = "";

    const handleReceiveMessage = (event) => {
        let data = JSON.parse(event.nativeEvent.data);
        switch(data.type){
            case "notif":
                notificationModule.showNotification(data.title, data.msg);
            break;
            case "firebase":
                firebase.registerApp(data._id, data.user);
            break;
            case "debug":
                lo(data.msg);
            break;
        }
    }

    const sendToFront = (data) => {
        try{
            if(!webViewRef.current) return;
            webViewRef.current.injectJavaScript(`apis.api.receiveMessage('${JSON.stringify(data)}')`)
        }catch(e){
            lo(e);
        }
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
        permission.requestUserPermission();
    }, []);

    (async () => {
        await notificationModule.checkApplicationPermission();
        notificationModule.initNotifications();
        
        console.log("Checking for updates...");
        const update = await updateFunc();
        if(update){
            console.log("Update available");
            notificationModule.showNotification("Update Required", "Please update the app", "updateCall");
        }
    })();

    return (
        <WebView
            source={{ uri: config.link+'/app' }}
            onMessage={e => handleReceiveMessage(e)}
            onNavigationStateChange={(navState) => {
                webviewUrl = navState.url;
            }}
            ref={webViewRef}
        />
    );
}

export default ReactNativeApp;

