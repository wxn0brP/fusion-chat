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
    const [webviewUrl, setWebviewUrl] = React.useState("");

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
                console.log(data.msg);
            break;
            default:
                console.log("unknown message", data);
        }
    }

    const sendToFront = (data) => {
        try{
            if(!webViewRef.current) return;
            webViewRef.current.injectJavaScript(`apis.api.receiveMessage('${JSON.stringify(data)}')`)
        }catch(e){
            console.error(e);
        }
    }

    const handleNavigationStateChange = (navState) => {
        setWebviewUrl(navState.url);
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
        
        const initApp = async () => {
            await notificationModule.checkApplicationPermission();
            notificationModule.initNotifications();
            
            console.log("Checking for updates...");
            const update = await updateFunc();
            if(update){
                console.log("Update available");
                notificationModule.showNotification("Update Required", "Please update the app", "updateCall");
            }
        }

        permission.requestUserPermission();
        initApp();
    }, []);


    return (
        <WebView
            source={{ uri: config.link+'/app' }}
            onMessage={e => handleReceiveMessage(e)}
            onNavigationStateChange={handleNavigationStateChange}
            ref={webViewRef}
        />
    );
}

export default ReactNativeApp;

