import { Notifications } from 'react-native-notifications';
import { PermissionsAndroid } from 'react-native';
import callbacks from './callbacks';

const initNotifications = () => {
    const channelId = 'channel_fc';
    const channelName = 'fc channel';
    const channelDescription = 'fc mobile channel';

    Notifications.registerRemoteNotifications();

    Notifications.getInitialNotification([
        {
            channelId,
            channelName,
            channelDescription,
            soundName: 'default',
            importance: 4, // IMPORTANCE_HIGH
            vibrate: true,
        },
    ]);

    // Notifications.events().registerNotificationReceivedForeground(
    //     (notification, completion) => {
    //         console.log('Notification Received - Foreground', notification.payload);
    //         completion({ alert: true, sound: true, badge: false });
    //     }
    // );
    // Notifications.events().registerNotificationReceivedBackground(
    //     (notification, completion) => {
    //         console.log('Notification Received - Background', notification.payload);
    //         completion({ alert: true, sound: true, badge: false });
    //     }
    // );

    Notifications.events().registerNotificationReceivedForeground((notification, completion) => {
      console.log(`Notification received in foreground: ${notification.title} : ${notification.body}`);
      completion({alert: false, sound: false, badge: false});
    });

    Notifications.events().registerNotificationOpened(
        (notification, completion) => {
            const notif = notification.payload;
            console.log('Notification opened', notif);

            if(notif.userInfo){
                const id = notif.userInfo;
                if(callbacks[id]) callbacks[id](notif);
            }
            completion();
        }
    );

    Notifications.events().registerRemoteNotificationsRegistered((event) => {
        console.log("Device Token Received");
    });

    Notifications.events().registerRemoteNotificationsRegistrationFailed((event) => {
        console.log("err", event);
    });
}

const showNotification = async (title, body, callbackId=null) => {
    const notification = {
        title, body,
        category: "FC_CATEGORY",
        userInfo: callbackId,
        link: 'localNotificationLink',
        fireDate: new Date().getTime(),
    }

    try{
        const id = Notifications.postLocalNotification(notification);
        console.log("notif res:", id);
    }catch(e){
        console.log("ee", e)
    }
}

const checkApplicationPermission = async () => {
    if(Platform.OS === 'android'){
        try{
            await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
            );
        }catch(error){
            console.log(e)
        }
    }
}

export default {
    initNotifications,
    showNotification,
    checkApplicationPermission
};
