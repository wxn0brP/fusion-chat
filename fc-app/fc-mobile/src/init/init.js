import vars from "../vars";
import updateFunc from "./update";
import firebase from "../config/firebase";
import permission from "../helpers/permission";
import { AppState, Linking } from "react-native";
import { sendToFront } from "../helpers/frontApi";
import notificationModule from "../modules/notificationModule";

export function initApp() {
    AppState.addEventListener("change", handleAppStateChange);
    permission.requestUserPermission();
    initUpdates();
    notificationModule.initNotifications();

    const cleanupFirebase = initializeFirebaseCallbacks();

    return () => {
        cleanupFirebase();
    };
}

function handleAppStateChange(nextAppState) {
    if (nextAppState !== "background") {
        sendToFront({ type: "unclose" });
        return;
    }
    if (vars?.webviewUrl?.endsWith("/app/")) {
        sendToFront({ type: "close" });
    }
}

async function initUpdates() {
    console.log("Checking for updates...");
    const update = await updateFunc();
    if (update) {
        console.log("Update available");
        notificationModule.showNotification(
            "Update Required",
            "Please update the app",
            { id: "updateCall" }
        );
    }
}

function initializeFirebaseCallbacks() {
    return firebase.initFbCallbacks(async (notif) => {
        await new Promise((resolve) => setTimeout(resolve, 3000)); // error less
        if (notif.type === "ctrl") {
            sendToFront({ type: "ctrl", ctrl: notif.data });
        }
    });
}

export function initDeepLinks() {
    const handleDeepLink = (event) => {
        const url = event.url;
        if (!url) return;
        setTimeout(() => {
            sendToFront({ type: "deepLink", url });
        }, 3000); // wait for webview to load
    };

    Linking.getInitialURL().then((url) => {
        if (url) handleDeepLink({ url });
    });

    const unsubscribe = Linking.addEventListener("url", handleDeepLink);

    return () => {
        unsubscribe.remove();
    };
}

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