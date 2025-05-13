const win = window as any;
win.app = {};

function globalExpose(bus: string, key: string, value: any) {
    if (win.app[bus]?.[key]) {
        console.warn(`[globalExpose] Overwriting existing key: ${bus}.${key}`);
    }

    win.app[bus] = win.app[bus] || {};
    win.app[bus][key] = value;
}

export default globalExpose;