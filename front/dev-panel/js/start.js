socket.connect();
{
    const userImg = document.querySelector("#header__user__img");
    userImg.src = "/api/profileImg?id=" + vars.user._id;
    userImg.title = "Logged as " + vars.user.fr;
}