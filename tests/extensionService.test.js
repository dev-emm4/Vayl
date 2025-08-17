import ExtensionService from "../src/serviceWorkers/extensionService";
import ConflictError from "../src/serviceWorkers/error/conflictError";

const extensionService = new ExtensionService();

describe("extensionService Test", () => {
  test("should create disableBlockingRule for specified url", async () => {
    chrome.declarativeNetRequest.resetDynamicRules([]);

    await extensionService.disableBlockingRuleForUrl("example.com");

    const dynamicRules = chrome.declarativeNetRequest.getDynamicRules();

    expect(dynamicRules[0].priority).toEqual(100);
    expect(dynamicRules[0].action.type).toEqual("allow");
    expect(dynamicRules[0].condition.urlFilter).toEqual("*");
    expect(dynamicRules[0].condition.initiatorDomain).toEqual("example.com");
  });

  test("should throw error if disableBlockingRule already exists for specified url", async () => {
    chrome.declarativeNetRequest.resetDynamicRules([]);

    await extensionService.disableBlockingRuleForUrl("example.com");

    expect(
      extensionService.disableBlockingRuleForUrl("example.com")
    ).rejects.toThrow(ConflictError);
    expect(
      extensionService.disableBlockingRuleForUrl("example.com")
    ).rejects.toThrow("blocking is already disabled");
  });

  test("should throw error if dynamicRules has hit max quota", async () => {
    const rule = {
      id: 1,
      priority: 100,
      action: {
        type: "allow",
      },
      condition: {
        urlFilter: "*",
        initiatorDomain: "example2.com",
      },
    };

    chrome.declarativeNetRequest.resetDynamicRules([]);
    chrome.declarativeNetRequest.addGenericRules(rule, 5000);

    expect(
      extensionService.disableBlockingRuleForUrl("example.com")
    ).rejects.toThrow(ConflictError);
    expect(
      extensionService.disableBlockingRuleForUrl("example.com")
    ).rejects.toThrow("dynamic rule has reach quota");
  });

  test("should remove disableBlockingRule for specified url from dynamicRule", async () => {
    const disableBlockingRule = {
      id: 1,
      priority: 100,
      action: {
        type: "allow",
      },
      condition: {
        urlFilter: "*",
        initiatorDomain: "example.com",
      },
    };

    chrome.declarativeNetRequest.resetDynamicRules([]);
    chrome.declarativeNetRequest.addGenericRules(disableBlockingRule, 4);

    await extensionService.enableBlockingForUrl("example.com");

    const dynamicRules = chrome.declarativeNetRequest.getDynamicRules();

    expect(dynamicRules).toEqual([]);
  });

  test("should throw error if disableBlockingRule for url does not exist", async () => {
    chrome.declarativeNetRequest.resetDynamicRules([]);

    expect(
      extensionService.enableBlockingForUrl("example.com")
    ).rejects.toThrow(ConflictError);
    expect(
      extensionService.enableBlockingForUrl("example.com")
    ).rejects.toThrow("blocking is already enabled");
  });

  test("should return false if disableBlockingRule exists for url", async () => {
    const disableBlockingRule = {
      id: 1,
      priority: 100,
      action: {
        type: "allow",
      },
      condition: {
        urlFilter: "*",
        initiatorDomain: "example.com",
      },
    };

    chrome.declarativeNetRequest.resetDynamicRules([]);
    chrome.declarativeNetRequest.addGenericRules(disableBlockingRule, 1); // disabling blocking for example.com

    const isBlockingEnabled = await extensionService.isBlockingEnabledFor(
      "example.com"
    );

    expect(isBlockingEnabled).toEqual(false);
  });

  test("should return true if disableBlockingRule does not exist for url", async () => {
    chrome.declarativeNetRequest.resetDynamicRules([]);

    const isBlockingEnabled = await extensionService.isBlockingEnabledFor(
      "example.com"
    );

    expect(isBlockingEnabled).toEqual(true);
  });

  test("should publish a disabledBlocking event", async () => {
    chrome.declarativeNetRequest.resetDynamicRules([]);
    chrome.runtime.resetEvent();

    await extensionService.disableBlockingRuleForUrl("example.com");

    const publishedEvent = chrome.runtime.getPublishedEvent();
    const expectedEvent = {
      action: "disabledBlocking",
      url: "example.com",
    };

    expect(publishedEvent).toEqual(expectedEvent);
  });

  test("should publish a enabledBlocking event", async () => {
    const disableBlockingRule = {
      id: 1,
      priority: 100,
      action: {
        type: "allow",
      },
      condition: {
        urlFilter: "*",
        initiatorDomain: "example.com",
      },
    };

    chrome.declarativeNetRequest.resetDynamicRules([]);
    chrome.runtime.resetEvent();
    chrome.declarativeNetRequest.addGenericRules(disableBlockingRule, 1); // disabling blocking for example.com

    await extensionService.enableBlockingForUrl("example.com");

    const publishedEvent = chrome.runtime.getPublishedEvent();
    const expectedEvent = {
      action: "enabledBlocking",
      url: "example.com",
    };

    expect(publishedEvent).toEqual(expectedEvent);
  });
});
