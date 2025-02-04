export async function get_bot_info(suser) {
    const data = {
        _id: suser._id,
        name: suser.name,
    };
    return { err: false, res: [data] };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYm90LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vYmFjay9zb2NrZXQvYm90L2xvZ2ljL2JvdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFHQSxNQUFNLENBQUMsS0FBSyxVQUFVLFlBQVksQ0FBQyxLQUFrQjtJQUNqRCxNQUFNLElBQUksR0FBRztRQUNULEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRztRQUNkLElBQUksRUFBRSxLQUFLLENBQUMsSUFBSTtLQUNuQixDQUFBO0lBQ0QsT0FBTyxFQUFFLEdBQUcsRUFBRSxLQUFLLEVBQUUsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQztBQUN2QyxDQUFDIn0=