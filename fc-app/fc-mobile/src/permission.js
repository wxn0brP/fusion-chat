import messaging from '@react-native-firebase/messaging';

const requestUserPermission = async () => {
    const authStatus = await messaging().requestPermission();
    console.log('Authorization Firebase status:', authStatus);
}

export default {
    requestUserPermission
}