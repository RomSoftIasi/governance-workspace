const {WebcController} = WebCardinal.controllers;

export default class MonitoringController extends WebcController {
    constructor(...props) {
        super(...props);

        this.initNavigationListeners();
    }

    initNavigationListeners() {
        this.onTagClick('navigate:back', () => {
            this.history.goBack();
        });
    }
}