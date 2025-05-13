import { UiComponent } from "#types/component";
import barView from "#components/app/bar.view";
import friendRequestView from "#components/app/friendRequest.view";
import friendsView from "#components/app/friends.view";
import mainView from "#components/app/main.view";
import navRealmsView from "#components/app/navRealm.view";
import navMainView from "#components/app/navMain.view";
import profileView from "#components/app/profile.view";
import realmsView from "#components/app/realms.view";
import messagesView from "#components/app/messages.view";
import messageCommandView from "#components/app/messageCommand.view";
import modalView from "#components/app/modal.view";

const components: UiComponent[] = [
    profileView,
    realmsView,
    mainView,
    friendsView,
    friendRequestView,
    barView,
    navMainView,
    navRealmsView,
    messagesView,
    messageCommandView,
    modalView,
];

for (const component of components) {
    component.mount();
}

export default components;