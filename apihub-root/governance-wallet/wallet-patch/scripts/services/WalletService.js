import fetch from "../utils/fetch.js";

class WalletService {
    getKeySSI(path, appName, callback) {
        const encodedPath = encodeURIComponent(path);
        const encodedAppName = encodeURIComponent(appName);
        const url = `/api-standard/app-seed?path=${encodedPath}&name=${encodedAppName}`;

        fetch(url)
            .then((response) => response.text())
            .then((keySSI) => {
                callback(null, keySSI);
            })
            .catch((err) => {
                console.error(`Failed to load ${appName} app seed from ${path}`, err);
                callback(err);
            });
    }

    getUserDetails(callback) {
        fetch("/api-standard/user-details")
            .then((response) => response.json())
            .then((userDetails) => {
                callback(null, userDetails);
            })
            .catch((err) => {
                console.error(`Failed to load user-details`, err);
                callback(err);
            });
    }
}

let walletServiceInstance = new WalletService();
let getWalletServiceInstance = function () {
    return walletServiceInstance;
};

export { getWalletServiceInstance };
