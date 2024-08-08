import { Linking } from 'react-native';
import config from './config';

const openExternalLink = (url) => {
    Linking.openURL(url).catch((err) => console.error('Błąd podczas otwierania linku:', err));
};

const callbacks = {
    updateCall: () => {
        openExternalLink(config.link+"/get");
    }
}

export default callbacks;