module.exports = {
    req: ["data"],
    type: "findOne",
    onDb: "data",
    onCol: "fireBaseUser",

    async run(data){
        const user = await global.databases.data.findOne("user", { _id: data._id });
        data.name = user.name;
    }
}