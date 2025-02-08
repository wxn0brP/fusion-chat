import { Linking } from "react-native";
import config from "../config/config";

const openExternalLink = (url) => {
    Linking.openURL(url).catch((err) => console.error("Błąd podczas otwierania linku:", err));
};

const callbacks = {
    updateCall: () => {
        openExternalLink(config.link+"/get?auto=true");
    }
}

export default callbacks;