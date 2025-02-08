import vars from "../vars";
import config from "../config/config";
import { WebView } from "react-native-webview";
import React, { useEffect, useRef } from "react";
import { initApp, initDeepLinks } from "../init/init";
import { handleReceiveMessage } from "../helpers/frontApi";
import audioRecorder from "../modules/audioRecorder";

const handleNavigationStateChange = (navState) => {
    vars.webviewUrl = navState.url;
}

const ReactNativeApp = () => {
    const webViewRef = useRef(null);
    vars.webViewRef = webViewRef;

    useEffect(initApp, []);
    useEffect(initDeepLinks, []);
    useEffect(() => {
        return () => {
            audioRecorder.stop();
        }
    })

    return (
        <WebView
            source={{ uri: config.link + "/app" }}
            onMessage={e => handleReceiveMessage(e)}
            onNavigationStateChange={handleNavigationStateChange}
            ref={webViewRef}

            mediaPlaybackRequiresUserAction={false}
            domStorageEnabled={true}
            allowsInlineMediaPlayback={true}
            startInLoadingState={true}
            onPermissionRequest={(request) => {
                if (request.permissions) request.grant();
            }}
        />
    );
}

export default ReactNativeApp;

