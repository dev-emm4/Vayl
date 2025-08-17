import ExtensionService from "../src/serviceWorkers/extensionService";
import ConflictError from "../src/serviceWorkers/error/conflictError";

const extensionService = new ExtensionService();

describe("extensionService Test", () => {
  test("should create disableBlockingRule", async () => {
    chrome.declarativeNetRequest.resetDynamicRules([]);

    await extensionService.disableBlockingRuleForUrl("example.com");

    const disableBlockingRule = chrome.declarativeNetRequest.getDynamicRules();

    expect(disableBlockingRule[0].priority).toEqual(100);
    expect(disableBlockingRule[0].action.type).toEqual("allow");
    expect(disableBlockingRule[0].condition.urlFilter).toEqual("*");
    expect(disableBlockingRule[0].condition.initiatorDomain).toEqual(
      "example.com"
    );
  });

  test("should throw error if disableBlockingRule already exists", async () => {
    chrome.declarativeNetRequest.resetDynamicRules([]);

    await extensionService.disableBlockingRuleForUrl("example.com");

    expect(
      extensionService.disableBlockingRuleForUrl("example.com")
    ).rejects.toThrow(ConflictError);
  });
});
