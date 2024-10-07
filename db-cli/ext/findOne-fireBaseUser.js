export const req = ["data"];
export const type = "findOne";
export const onDb = "data";
export const onCol = "fireBaseUser";
export async function run(data) {
    const user = await global.databases.data.findOne("user", { _id: data._id });
    data.name = user.name;
}