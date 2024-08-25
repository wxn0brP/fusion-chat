module.exports = {
    req: ["data","userDatas"],
    type: "list_table",
    onDb: "userDatas",
    async run(data){
        const maped = data.map(async (userId) => {
            const user = await global.databases.data.findOne("user", { _id: userId });
            if(!user) return userId;
            return {
                name: `${userId} (${user.name})`,
                value: userId
            };
        });

        data = await Promise.all(maped);
        return data;
    }
}