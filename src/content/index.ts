import {ServiceFactory} from "./service.factory";

const service = ServiceFactory.getService(window.location.host.replace("www.", ""));

if (service) {
    chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
        switch (request.action) {
            case "pause":
                service.pause();
                break;

            case "play":
                service.play();
                break;
        }
    });

    chrome.runtime.onInstalled.addListener(function () {
        console.log("update");
    });
    // chrome.runtime.onConnect.addListener(function (port) {
    //     console.log("connected");
    //     port.onDisconnect.addListener(function () {
    //         console.log("onDisconnect");
    //     });
    // });
}
