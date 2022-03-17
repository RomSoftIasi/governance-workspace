const {WebcController} = WebCardinal.controllers;

export default class ToolsController extends WebcController {
    constructor(...props) {
        super(...props);

        this.initNavigationListeners();
    }

    initNavigationListeners() {
        this.onTagClick('navigate:monitoring', () => {
            this.navigateToPageTag("monitoring");
        });

        this.onTagClick('navigate:performance-testing', () => {
            this.navigateToPageTag("performance-testing");
        });

        this.onTagClick('navigate:back', () => {
            this.history.goBack();
        });
    }
}