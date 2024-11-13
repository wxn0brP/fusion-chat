const os = require("os");
const TOLERANCE = 10;

if(os.platform() === "linux"){
    const { api } = require("win32-api");

    const user32 = api.user32;

    const SM_CXSCREEN = 0;
    const SM_CYSCREEN = 1;

    module.exports = () => {
        const hWnd = user32.GetForegroundWindow();
        const rect = Buffer.alloc(16);
        user32.GetWindowRect(hWnd, rect);

        const left = rect.readInt32LE(0);
        const top = rect.readInt32LE(4);
        const right = rect.readInt32LE(8);
        const bottom = rect.readInt32LE(12);

        const screenWidth = user32.GetSystemMetrics(SM_CXSCREEN);
        const screenHeight = user32.GetSystemMetrics(SM_CYSCREEN);

        const windowWidth = right - left;
        const windowHeight = bottom - top;

        const isFullscreen = 
            Math.abs(windowWidth - screenWidth) <= TOLERANCE &&
            Math.abs(windowHeight - screenHeight) <= TOLERANCE;

        if(isFullscreen){
            const titleBuffer = Buffer.alloc(512);
            user32.GetWindowTextW(hWnd, titleBuffer, 512);
            const windowTitle = titleBuffer.toString("ucs2").replace(/\0/g, "");
            console.log("windowTitle", windowTitle);
            return windowTitle || "";
        }else{
            return "";
        }
    }
}else if(os.platform() === "linux"){
    const { exec } = require("child_process");
    module.exports = () => {
        return new Promise(async (resolve, reject) => {
            const dataNext = { resolve, reject };

            const checkCmds = await checkCommands(dataNext);
            if(!checkCmds) return;

            getActiveWindowTitle(dataNext);
        });
    }

    async function checkCommands(dataNext){
        function tryCmd(cmd){
            return new Promise((resolve) => {
                exec("command -v " + cmd, (error, stdout) => resolve(!!stdout));
            })
        }

        const cmds = ["xdotool", "xrandr"];
        for(const cmd of cmds){
            const res = await tryCmd(cmd);
            if(res) continue;
            dataNext.reject(`Error (screen) command "${cmd}" doesn"t installed`);
            return false;
        }
        return true;
    }
    
    function getActiveWindowTitle(dataNext){
        exec("xdotool getwindowfocus getwindowname", (error, stdout, stderr) => {
            if(error || stderr){
                dataNext,reject(`Error (screen): ${error || stderr}`);
                return;
            }
            dataNext.windowTitle = stdout.trim();
            getWindowGeometry(dataNext);
        });
    }
    
    function getWindowGeometry(dataNext){
        exec("xdotool getwindowfocus getwindowgeometry --shell", (err, geomOut) => {
            if(err){
                dataNext.reject(`Error (screen) while getting window geometry: ${err.message}`);
                return;
            }
            dataNext.windowWidth = parseInt(geomOut.match(/WIDTH=(\d+)/)[1], 10);
            dataNext.windowHeight = parseInt(geomOut.match(/HEIGHT=(\d+)/)[1], 10);
            dataNext.windowX = parseInt(geomOut.match(/X=(\d+)/)[1], 10);
            dataNext.windowY = parseInt(geomOut.match(/Y=(\d+)/)[1], 10);
    
            getScreenInformation(dataNext);
        });
    }
    
    function getScreenInformation(dataNext){
        exec(`xrandr | grep " connected "`, (xrErr, xrOut) => {
            if(xrErr){
                dataNext.reject(`Error (screen) fetching screen information: ${xrErr.message}`);
                return;
            }
            
            dataNext.monitors = parseMonitorInformation(xrOut);
            findMonitor(dataNext);
        });
    }
    
    function parseMonitorInformation(xrOut){
        return xrOut.split("\n").map(line => {
            const [, resolution] = line.match(/\b(\d+x\d+\+\d+\+\d+)\b/) || [];
            
            const [resWidth, resHeight, resX, resY] = resolution
                ? resolution.split(/x|\+/).map(Number)
                : [0, 0, 0, 0];
            return { resWidth, resHeight, resX, resY };
        }).filter(m => m.resWidth && m.resHeight);
    }
    
    function findMonitor(dataNext){
        const monitor = dataNext.monitors.find(({ resX, resY, resWidth, resHeight }) =>
            dataNext.windowX >= resX &&
            dataNext.windowX < resX + resWidth &&
            dataNext.windowY >= resY &&
            dataNext.windowY < resY + resHeight
        );
    
        if(!monitor){
            dataNext.resolve("Cannot determine the monitor for the active window.");
            return;
        }
        dataNext.monitor = monitor;
    
        checkFullscreen(dataNext);
    }
    
    function checkFullscreen(dataNext){
        const isFullscreen = 
            Math.abs(dataNext.monitor.resWidth - dataNext.windowWidth) <= TOLERANCE &&
            Math.abs(dataNext.monitor.resHeight - dataNext.windowHeight) <= TOLERANCE;
    
        dataNext.resolve(isFullscreen ? dataNext.windowTitle : "");
    }
}else{
    module.exports = () => "";
}