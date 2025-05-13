import socket from "#socket";

export function socketFetch<T=any>(event: string, ...data: any): Promise<T> {
    return new Promise((resolve, reject) => {
        socket.emit(event, ...data, (...data: any) => {
            resolve(data as T);
        });
    })
}