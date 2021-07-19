const {WebcController} = WebCardinal.controllers;
import LoaderCommunication from "../services/LoaderCommunication.js";

export default class LogoutController extends WebcController {
    constructor(...props) {
        super(...props);

        this.logout();
    }

    logout() {
        LoaderCommunication.sendMessage({
            status: "sign-out"
        });
    }
}