import { version } from "../package.json";

export default {
    link: __DEV__ ? "http://192.168.0.15:1478" : "https://fusion.ct8.pl",
    version,
}