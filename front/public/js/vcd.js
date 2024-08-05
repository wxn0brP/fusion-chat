new Vue({
    el: '#app',
    data: {
        logs: [],
        users: {},
        sortKey: 'time',
        sortAscending: true,
        filterLevel: ''
    },
    computed: {
        filteredAndSortedLogs() {
            let filteredLogs = this.logs;

            if (this.filterLevel) {
                filteredLogs = filteredLogs.filter(log => log.level === this.filterLevel);
            }

            filteredLogs.sort((a, b) => {
                if (this.sortKey === 'relativeTime') {
                    const aTime = parseFloat(a.relativeTime);
                    const bTime = parseFloat(b.relativeTime);
                    return this.sortAscending ? aTime - bTime : bTime - aTime;
                } else {
                    const aValue = a[this.sortKey];
                    const bValue = b[this.sortKey];
                    if (aValue < bValue) return this.sortAscending ? -1 : 1;
                    if (aValue > bValue) return this.sortAscending ? 1 : -1;
                    return 0;
                }
            });

            return filteredLogs;
        }
    },
    methods: {
        async handleFileUpload(event) {
            const files = event.target.files;
            const promises = [];

            for (let i = 0; i < files.length; i++) {
                promises.push(this.readFile(files[i]));
            }

            const results = await Promise.all(promises);
            const mergedLogs = [].concat(...results);
            this.logs = mergedLogs.sort((a, b) => new Date(a.time) - new Date(b.time));
            this.addRelativeTimes();
            this.loadUserNames();
        },
        readFile(file) {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        const data = JSON.parse(e.target.result);
                        data.forEach(log => log.time = new Date(log.time));
                        resolve(data);
                    } catch (error) {
                        reject(error);
                    }
                };
                reader.onerror = (e) => reject(e);
                reader.readAsText(file);
            });
        },
        getUserName(userId) {
            return this.users[userId] || userId;
        },
        async loadUserNames() {
            const userIds = [...new Set(this.logs.map(log => log.user))];
            for (const id of userIds) {
                this.users[id] = await apis.www.changeUserID(id);
            }
        },
        addRelativeTimes() {
            if (this.logs.length === 0) return;
            const startTime = new Date(this.logs[0].time);
            this.logs.forEach(log => {
                const logTime = new Date(log.time);
                const relativeTime = ((logTime - startTime) / 1000).toFixed(2);
                log.relativeTime = relativeTime + 's';
            });
        },
        formatDate(date) {
            return date.toLocaleTimeString();
        }
    },
    mounted() {
        
    }
});
