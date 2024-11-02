import os from "os";
import crypto from "crypto";

function generateJwtSecret(){
    const macAddresses = os.networkInterfaces();
    const hostname = os.hostname();
    const cpuModels = os.cpus()[0].model;
    const platform = os.platform();
    const arch = os.arch();

    const macAddress = Object.values(macAddresses)
        .flat()
        .filter(iface => iface.mac !== '00:00:00:00:00:00' && !iface.internal)
        .map(iface => iface.mac)
        .join('-');
    const secretData = `${hostname}-${cpuModels}-${platform}-${arch}-${macAddress}`;

    return crypto.createHash('sha256').update(secretData).digest('hex');
}

export default generateJwtSecret;