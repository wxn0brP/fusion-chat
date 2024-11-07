import notifee, { EventType } from '@notifee/react-native';
import callbacks from './notifCallbacks';

let channelId = null;

const initNotifications = async () => {
    // Request permissions (required for iOS)
    await notifee.requestPermission();

    // Create a channel (required for Android)
    channelId = await notifee.createChannel({
        id: 'fc-channel',
        name: 'FusionChat',
    });

    function callbacksFn(type, detail){
        if(type !== EventType.PRESS || !detail.pressAction.id) return;
        const cb = callbacks[detail.pressAction.id];
        if(cb) cb();
    }

    notifee.onForegroundEvent(data => {
        callbacksFn(data.type, data.detail);
    });

    notifee.onBackgroundEvent(data => {
        callbacksFn(data.type, data.detail);
    })
}

const showNotification = async (title, body, pressOpts={}, opts={}) => {
    await notifee.displayNotification({
        title,
        body,
        android: {
            channelId,
            pressAction: {
                id: 'default',
                ...pressOpts
            },
            ...opts
        }
    });
}

export default {
    initNotifications,
    showNotification,
};
