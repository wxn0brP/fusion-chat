import React, { useEffect, useRef } from 'react';
import { AppState } from 'react-native';
import { WebView } from 'react-native-webview';
import notificationModule from './notificationModule';
import updateFunc from "./update";
import config from "./config";
import firebase from "./firebase";
import permission from "./permission";

import AudioRecorder from './AudioRecorder';
import Distribution from "./Distribution";

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

    useEffect(() => {
        return () => {
            AudioRecorder.stop();
        };
    }, []);

    useEffect(() => {
        const logDist = async () => {
            const distro = await Distribution.getInstallSource();
            const distroName = Distribution.getInstallSourceName(distro);
            setTimeout(() => {
                if(!webViewRef.current) return;
                // webViewRef.current.injectJavaScript(`apis.api.distribution('${distro}', '${distroName}')`)
            }, 3000);
        }

        logDist();
    }, []);

    const startRecording = async () => {
        await permission.requestMicrophonePermission();
        AudioRecorder.start((data) => {
            if(!webViewRef.current) return;
            webViewRef.current.injectJavaScript(`apis.api.receiveAudio('${data}')`)
        });
    }

    return (
        <WebView
            source={{ uri: config.link+'/app' }}
            onMessage={e => handleReceiveMessage(e)}
            onNavigationStateChange={handleNavigationStateChange}
            ref={webViewRef}

            mediaPlaybackRequiresUserAction={false}
            domStorageEnabled={true}
            allowsInlineMediaPlayback={true}
            startInLoadingState={true}
            onPermissionRequest={(request) => {
                if(request.permissions) request.grant();
            }}
        />
    );
}

export default ReactNativeApp;

