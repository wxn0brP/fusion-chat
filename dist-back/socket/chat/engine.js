class SocketEventEngine {
    socket;
    constructor(socket) {
        this.socket = socket;
    }
    add(evt, time, isReturn, cpu) {
        this.socket.onLimit(evt, time, async (...args) => {
            try {
                const data = await cpu(this.socket.user, ...args);
                if (this.socket.processSocketError(data))
                    return;
                if (isReturn) {
                    const cb = typeof args[args.length - 1] === "function" ? args.pop() : null;
                    const res = data.res || [];
                    if (cb)
                        cb(...res);
                    else
                        this.socket.emit(evt, ...res);
                }
            }
            catch (e) {
                this.socket.logError(e);
            }
        });
    }
}
export default SocketEventEngine;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZW5naW5lLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vYmFjay9zb2NrZXQvY2hhdC9lbmdpbmUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBRUEsTUFBTSxpQkFBaUI7SUFDbkIsTUFBTSxDQUFTO0lBRWYsWUFBWSxNQUFjO1FBQ3RCLElBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO0lBQ3pCLENBQUM7SUFFRCxHQUFHLENBQUMsR0FBVyxFQUFFLElBQVksRUFBRSxRQUFpQixFQUFFLEdBQWE7UUFDM0QsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsR0FBRyxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsR0FBRyxJQUFTLEVBQUUsRUFBRTtZQUVsRCxJQUFJLENBQUM7Z0JBQ0QsTUFBTSxJQUFJLEdBQUcsTUFBTSxHQUFHLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsR0FBRyxJQUFJLENBQUMsQ0FBQztnQkFFbEQsSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQztvQkFBRSxPQUFPO2dCQUVqRCxJQUFJLFFBQVEsRUFBRSxDQUFDO29CQUNYLE1BQU0sRUFBRSxHQUFHLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLEtBQUssVUFBVSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztvQkFDM0UsTUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLEdBQUcsSUFBSSxFQUFFLENBQUM7b0JBQzNCLElBQUksRUFBRTt3QkFBRSxFQUFFLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQzs7d0JBQ2QsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLEdBQUcsR0FBRyxDQUFDLENBQUM7Z0JBQ3ZDLENBQUM7WUFDTCxDQUFDO1lBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQztnQkFDVCxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUM1QixDQUFDO1FBQ0wsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDO0NBQ0o7QUFFRCxlQUFlLGlCQUFpQixDQUFDIn0=