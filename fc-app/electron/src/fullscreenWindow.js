const os = require("os");
const TOLERANCE = 10;

if (os.platform() === "win32") {
    const koffi = require("koffi");

    const user32 = koffi.load("user32.dll");

    const SM_CXSCREEN = 0;
    const SM_CYSCREEN = 1;

    const GetForegroundWindow = user32.func("void* GetForegroundWindow()");
    const GetWindowRect = user32.func("bool GetWindowRect(void*, void*)");
    const GetSystemMetrics = user32.func("int GetSystemMetrics(int)");
    const GetWindowTextW = user32.func("int GetWindowTextW(void*, void*, int)");

    module.exports = () => {
        const hWnd = GetForegroundWindow();
        const rectBuffer = Buffer.alloc(16);

        if (!GetWindowRect(hWnd, rectBuffer)) {
            throw new Error("Failed to get window rectangle");
        }

        const left = rectBuffer.readInt32LE(0);
        const top = rectBuffer.readInt32LE(4);
        const right = rectBuffer.readInt32LE(8);
        const bottom = rectBuffer.readInt32LE(12);

        const screenWidth = GetSystemMetrics(SM_CXSCREEN);
        const screenHeight = GetSystemMetrics(SM_CYSCREEN);

        const windowWidth = right - left;
        const windowHeight = bottom - top;

        const isFullscreen =
            Math.abs(windowWidth - screenWidth) <= TOLERANCE &&
            Math.abs(windowHeight - screenHeight) <= TOLERANCE;

        let windowTitle = "";
        if (isFullscreen) {
            const titleBuffer = Buffer.alloc(512);
            GetWindowTextW(hWnd, titleBuffer, 512);
            windowTitle = titleBuffer.toString("ucs2").replace(/\0/g, "") || "";
        }

        return new Promise(resolve => resolve(windowTitle));
    }
} else if (os.platform() === "linux") {
    const { exec } = require("child_process");
    let commandsExist = 0;
    const notExistsCheck = 20; // how many times to check if commands exist if not found

    module.exports = () => {
        return new Promise(async (resolve, reject) => {
            const dataNext = { resolve, reject };
            
            if (commandsExist < 0) {
                dataNext.reject("Error (screen) command doesn't installed");
                return;
            }

            if (commandsExist == 0 || commandsExist < -notExistsCheck) {
                const checkCmds = await checkCommands(dataNext);
                if (commandsExist < -notExistsCheck) commandsExist = 0;
                if (!checkCmds){
                    commandsExist--;
                    return;
                }
                commandsExist = 1;
            }

            getActiveWindowTitle(dataNext);
        });
    }

    async function checkCommands(dataNext) {
        function tryCmd(cmd) {
            return new Promise((resolve) => {
                exec("command -v " + cmd, (error, stdout) => resolve(!!stdout));
            })
        }

        const cmds = ["xdotool", "xrandr"];
        for (const cmd of cmds) {
            const res = await tryCmd(cmd);
            if (res) continue;
            dataNext.reject(`Error (screen) command "${cmd}" doesn't installed`);
            return false;
        }
        return true;
    }

    function getActiveWindowTitle(dataNext) {
        exec("xdotool getwindowfocus getwindowname", (error, stdout, stderr) => {
            if (error || stderr) {
                dataNext, reject(`Error (screen): ${error || stderr}`);
                return;
            }
            dataNext.windowTitle = stdout.trim();
            getWindowGeometry(dataNext);
        });
    }

    function getWindowGeometry(dataNext) {
        exec("xdotool getwindowfocus getwindowgeometry --shell", (err, geomOut) => {
            if (err) {
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

    function getScreenInformation(dataNext) {
        exec(`xrandr | grep " connected "`, (xrErr, xrOut) => {
            if (xrErr) {
                dataNext.reject(`Error (screen) fetching screen information: ${xrErr.message}`);
                return;
            }

            dataNext.monitors = parseMonitorInformation(xrOut);
            findMonitor(dataNext);
        });
    }

    function parseMonitorInformation(xrOut) {
        return xrOut.split("\n").map(line => {
            const [, resolution] = line.match(/\b(\d+x\d+\+\d+\+\d+)\b/) || [];

            const [resWidth, resHeight, resX, resY] = resolution
                ? resolution.split(/x|\+/).map(Number)
                : [0, 0, 0, 0];
            return { resWidth, resHeight, resX, resY };
        }).filter(m => m.resWidth && m.resHeight);
    }

    function findMonitor(dataNext) {
        const monitor = dataNext.monitors.find(({ resX, resY, resWidth, resHeight }) =>
            dataNext.windowX >= resX &&
            dataNext.windowX < resX + resWidth &&
            dataNext.windowY >= resY &&
            dataNext.windowY < resY + resHeight
        );

        if (!monitor) {
            dataNext.resolve("Cannot determine the monitor for the active window.");
            return;
        }
        dataNext.monitor = monitor;

        checkFullscreen(dataNext);
    }

    function checkFullscreen(dataNext) {
        const isFullscreen =
            Math.abs(dataNext.monitor.resWidth - dataNext.windowWidth) <= TOLERANCE &&
            Math.abs(dataNext.monitor.resHeight - dataNext.windowHeight) <= TOLERANCE;

        dataNext.resolve(isFullscreen ? dataNext.windowTitle : "");
    }
} else {
    module.exports = () => new Promise(resolve => resolve(""));
}