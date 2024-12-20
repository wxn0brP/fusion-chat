import React, { useEffect, useRef, useState } from "react";
import { AppState, Linking, NativeModules } from "react-native";
import { WebView } from "react-native-webview";
import notificationModule from "./notificationModule";
import updateFunc from "./update";
import config from "./config";
import firebase from "./firebase";
import permission from "./permission";

import AudioRecorder from "./AudioRecorder";
// import Distribution from "./Distribution";

const ReactNativeApp = () => {
    const webViewRef = useRef(null);
    const [webviewUrl, setWebviewUrl] = useState("");

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
            case "openLinkSettings":
                NativeModules.DefaultLinkSettings.openAppLinkSettings();
            break;
            default:
                console.log("unknown message", data);
        }
    }

    const sendToFront = (data) => {
        try{
            if(!webViewRef.current) return console.error("no webview");
            data = JSON.stringify(data);
            data = "magistral.apis.api.receiveMessage(`" + data + "`)"
            webViewRef.current.injectJavaScript(data);
        }catch(e){
            console.error(e);
        }
    }

    const handleNavigationStateChange = (navState) => {
        setWebviewUrl(navState.url);
    }

    useEffect(() => {
        const handleAppStateChange = (nextAppState) => {
            if(nextAppState !== "background"){
                sendToFront({ type: "unclose" });
                return;
            }
            if(webviewUrl.endsWith("/app/")){
                sendToFront({ type: "close" });
            }
        };
        AppState.addEventListener("change", handleAppStateChange);
        
        const initApp = async () => {
            await notificationModule.initNotifications();
            
            console.log("Checking for updates...");
            const update = await updateFunc();
            if(update){
                console.log("Update available");
                notificationModule.showNotification(
                    "Update Required",
                    "Please update the app",
                    { id: "updateCall" }
                );
            }
        }

        permission.requestUserPermission();
        initApp();
        const initFbCallbacks = firebase.initFbCallbacks(async (notif) => {
            await new Promise((resolve) => setTimeout(resolve, 3000)); // error less
            if(notif.type == "ctrl"){
                sendToFront({ type: "ctrl", ctrl: notif.data });
            }
        });

        return () => {
            initFbCallbacks();
        }
    }, []);

    useEffect(() => {
        return () => {
            AudioRecorder.stop();
        };
    }, []);

    // useEffect(() => {
    //     const logDist = async () => {
    //         const distro = await Distribution.getInstallSource();
    //         const distroName = Distribution.getInstallSourceName(distro);
    //         setTimeout(() => {
    //             if(!webViewRef.current) return;
    //             webViewRef.current.injectJavaScript(`apis.api.distribution("${distro}", "${distroName}")`)
    //         }, 3000);
    //     }

    //     logDist();
    // }, []);

    useEffect(() => {
        const handleDeepLink = (event) => {
            const url = event.url;
            if(!url) return;
            setTimeout(() => {
                sendToFront({ type: "deepLink", url });
            }, 3000); // wait for webview to load
        };
    
        Linking.getInitialURL().then((url) => {
            if(url) handleDeepLink({ url });
        });
    
        const unsubscribe = Linking.addEventListener("url", handleDeepLink);

        return () => {
            unsubscribe.remove();
        };
    }, []);

    const startRecording = async () => {
        await permission.requestMicrophonePermission();
        AudioRecorder.start((data) => {
            if(!webViewRef.current) return;
            webViewRef.current.injectJavaScript(`magistral.apis.api.receiveAudio("${data}")`)
        });
    }

    return (
        <WebView
            source={{ uri: config.link+"/app" }}
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

