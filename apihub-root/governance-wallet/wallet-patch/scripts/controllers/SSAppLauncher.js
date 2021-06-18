const {WebcController} = WebCardinal.controllers;
import {getWalletServiceInstance} from "../services/WalletService.js";

const APPS_FOLDER = "/apps";

export default class SSAppLauncher extends WebcController {
    constructor(element, history) {
        super(element, history);

        this.model = {
            appName: null,
            keySSI: null,
            params: null
        };
        this.WalletService = getWalletServiceInstance();

        this.setAppName();
    }

    setAppName = () => {
        const appName = this.element.getAttribute("data-app-name");
        if (appName && appName.trim().length) {
            this.setAppNameAttribute(appName);
            this.getKeySSIAndParams(appName);
        }
    }

    setAppNameAttribute = (appName) => {
        const pskSSAppElement = this.element.querySelector("psk-ssapp");
        if (pskSSAppElement) {
            pskSSAppElement.setAttribute("app-name", appName);
        }
    }

    getKeySSIAndParams = (appName) => {
        this.WalletService.getKeySSI(APPS_FOLDER, appName, (err, keySSI) => {
            if (err) {
                throw Error(`Failed to load SSI from ${APPS_FOLDER / appName}`);
            }

            this.WalletService.getUserDetails((err, userDetails) => {
                if (err) {
                    throw Error(`Failed to get user details`);
                }

                this.model.params = userDetails;
            });

            this.model.keySSI = keySSI;
            console.log("[Open SSApp] " + appName + " with KeySSI: " + keySSI);
        });
    }
}