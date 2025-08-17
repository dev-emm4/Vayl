import ExtensionService from "./extensionService.js";
import ConflictError from "./error/conflictError.js";

const extensionService = new ExtensionService();

chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  try {
    if (message.action == "disableBlocking") {
      await extensionService.disableBlockingRuleForUrl(message.url);
    } else if (message.action == "enableBlocking") {
      await extensionService.enableBlockingForUrl(message.url);
    } else if (message.action == "isRuleEnabled") {
      const isRuleEnabled = extensionService.isBlockingEnabledFor(message.url);

      sendResponse(isRuleEnabled);
    }
  } catch (error) {
    if (
      error instanceof ConflictError &&
      error.message == "url is already enabled"
    ) {
      return;
    } else if (
      error instanceof ConflictError &&
      error.message == "url is already disabled"
    ) {
      return;
    } else {
      console.log(error);
    }
  }
});

function name(params) {
  ex;
}
