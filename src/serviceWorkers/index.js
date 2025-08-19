import ExtensionController from "./extensionController.js";

const extensionController = new ExtensionController();

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  (async () => {
    try {
      if (message.action == "disableBlocking") {
        await extensionController.disableBlocking(message, sendResponse);
      } else if (message.action == "enableBlocking") {
        await extensionController.enableBlocking(message, sendResponse);
      } else if (message.action == "isBlockingEnabled") {
        await extensionController.isBlockingEnabled(message, sendResponse);
      }
    } catch (error) {
      sendResponse({ error: error.message });
    }
  })();

  return true; // Keep message channel open
});
