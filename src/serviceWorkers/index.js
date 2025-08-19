import ExtensionController from "./extensionController.js";

const extensionController = new ExtensionController();

chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  if (message.action == "disableBlocking") {
    extensionController.disableBlocking(message, sendResponse);
  } else if (message.action == "enableBlocking") {
    extensionController.enableBlocking(message, sendResponse);
  } else if (message.action == "isRuleEnabled") {
    extensionController.enableBlocking(message, sendResponse);
  }
});
