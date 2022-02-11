const {WebcController} = WebCardinal.controllers;

export default class HomepageController extends WebcController {
    constructor(...props) {
        super(...props);

        this.updateProfile();
        this.initNavigationListeners();
    }

    initNavigationListeners() {
        this.onTagClick('governance-dashboard', (model, target, event) => {
            event.preventDefault();
            event.stopImmediatePropagation();

            this.navigateToPageTag("governance-dashboard");
        });

        this.onTagClick('organizations', (model, target, event) => {
            event.preventDefault();
            event.stopImmediatePropagation();

            this.navigateToPageTag("organizations");
        });

        this.onTagClick('tools', (model, target, event) => {
            event.preventDefault();
            event.stopImmediatePropagation();

            this.navigateToPageTag("tools");
        });
    }

    updateProfile() {
        const webcAppIdentityElement = document.querySelector("webc-app-identity");
        if (!webcAppIdentityElement) {
            return;
        }

        const logoElement = document.createElement("img");
        logoElement.src = "/assets/images/logo.png";
        logoElement.width = 100;

        const linkElement = document.createElement("a");
        linkElement.href = "/";
        linkElement.append(logoElement);

        webcAppIdentityElement.shadowRoot.innerHTML = linkElement.outerHTML;
    }
}