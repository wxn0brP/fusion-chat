import messaging from '@react-native-firebase/messaging';
import axios from "axios";
import config from "./config";

const registerApp = async (pointerToken) => {
    try{
        const fireToken = await messaging().getToken();
        const res = await axios.post(config.link+"/api/fireToken", {
            fireToken,
            fcToken: pointerToken,
        });
        console.log("res token add", res.data.err, res.data.msg);
    }catch(e){
        console.error("error token add:", e.message);
    }
}

export default {
    registerApp
}