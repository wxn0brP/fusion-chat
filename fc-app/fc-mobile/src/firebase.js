import messaging from '@react-native-firebase/messaging';
import axios from "axios";
import config from "./config";

const registerApp = async (id, user) => {
    try{
        const token = await messaging().getToken();
        const res = await axios.post(config.link+"/api/notif-reg", {
            token,
            id,
            user
        });
        console.log("res token add", res.data.err, res.data.msg);
    }catch(e){
        console.error(e.message);
    }
}

export default {
    registerApp
}