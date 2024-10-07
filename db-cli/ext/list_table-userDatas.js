export const req = ["data", "userDatas"];
export const type = "list_table";
export const onDb = "userDatas";
export async function run(data){
    const maped = data.map(async (userId) => {
        const user = await global.databases.data.findOne("user", { _id: userId });
        if(!user) return userId;
        return {
            name: `${userId} (${user.name})`,
            value: userId
        }
    });

    data = await Promise.all(maped);
    return data;
}