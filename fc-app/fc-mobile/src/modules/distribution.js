import { NativeModules } from "react-native";
const { InstallSourceModule } = NativeModules;

const installerPackageNameMap = {
    "com.android.vending": "Google Play",
    "org.fdroid.fdroid": "F-Droid",
    "cm.aptoide.pt": "Aptoide",
    "com.google.android.packageinstaller": "Manual Install",
    "unknown": "Sideload (Manual Install)"
};

async function getInstallSource(){
    try{
        const installerPackageName = await InstallSourceModule.getInstallerPackageName();
        return installerPackageName;
    }catch(error){
        console.error("Error getting install source:", error);
    }
}

function getInstallSourceName(installerPackageName){
    return installerPackageNameMap[installerPackageName] || installerPackageNameMap["unknown"];
}

export default { getInstallSource, getInstallSourceName }