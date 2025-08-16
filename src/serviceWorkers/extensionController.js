import ExtensionService from "./extensionService";

const extensionService = new ExtensionService();

chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  try {
    if (message.action === "disableBlocking") {
      await extensionService.disableBlockingRuleForUrl(message.url);
    } else if (message.action === "enableBlocking") {
      await extensionService.enableBlockingForUrl(message.url);
    } else if (message.action === "isRuleEnabled") {
      const isRuleEnabled = extensionService.isBlockingEnabledFor(message.url);

      sendResponse(isRuleEnabled);
    }
  } catch (error) {}
});
