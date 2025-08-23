import TrackerBlockingManager from "../src/applicationService/trackerBlockingManager";
import ConflictError from "../src/error/conflictError";

const trackerBlockingManager = new TrackerBlockingManager();

describe("TrackerBlockingManager Test", () => {
  test("should disable blocking for specified domain", async () => {
    chrome.declarativeNetRequest.resetDynamicRules([]);

    await trackerBlockingManager.disableBlockingForUrl("http://example.com/");

    const dynamicRules = chrome.declarativeNetRequest.getDynamicRules();

    expect(dynamicRules[0].priority).toEqual(100);
    expect(dynamicRules[0].action.type).toEqual("allow");
    expect(dynamicRules[0].condition.urlFilter).toEqual("*");
    expect(dynamicRules[0].condition.initiatorDomains[0]).toEqual(
      "example.com"
    );
  });

  test("should throw error if blocking is already disabled for specified domain", async () => {
    chrome.declarativeNetRequest.resetDynamicRules([]);

    await trackerBlockingManager.disableBlockingForUrl("http://example.com/");

    expect(
      trackerBlockingManager.disableBlockingForUrl("http://example.com/")
    ).rejects.toThrow(ConflictError);
    expect(
      trackerBlockingManager.disableBlockingForUrl("http://example.com/")
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
        initiatorDomains: ["example2.com"],
      },
    };

    chrome.declarativeNetRequest.resetDynamicRules([]);
    chrome.declarativeNetRequest.addGenericRules(rule, 5000);

    expect(
      trackerBlockingManager.disableBlockingForUrl("http://example.com/")
    ).rejects.toThrow(ConflictError);
    expect(
      trackerBlockingManager.disableBlockingForUrl("http://example.com/")
    ).rejects.toThrow("dynamic rule has reach quota");
  });

  test("should enable blocking for specified domain ", async () => {
    const disableBlockingRule = {
      id: 1,
      priority: 100,
      action: {
        type: "allow",
      },
      condition: {
        urlFilter: "*",
        initiatorDomains: ["example.com"],
      },
    };

    chrome.declarativeNetRequest.resetDynamicRules([]);
    chrome.declarativeNetRequest.addGenericRules(disableBlockingRule, 4); // disabling blocking for example.com

    await trackerBlockingManager.enableBlockingForUrl("http://example.com/");

    const dynamicRules = chrome.declarativeNetRequest.getDynamicRules();

    expect(dynamicRules).toEqual([]);
  });

  test("should throw error if blocking is already enable for domain", async () => {
    chrome.declarativeNetRequest.resetDynamicRules([]);

    expect(
      trackerBlockingManager.enableBlockingForUrl("http://example.com/")
    ).rejects.toThrow(ConflictError);
    expect(
      trackerBlockingManager.enableBlockingForUrl("http://example.com/")
    ).rejects.toThrow("blocking is already enabled");
  });

  test("should return false if blocking is disabled for domain", async () => {
    const disableBlockingRule = {
      id: 1,
      priority: 100,
      action: {
        type: "allow",
      },
      condition: {
        urlFilter: "*",
        initiatorDomains: ["example.com"],
      },
    };

    chrome.declarativeNetRequest.resetDynamicRules([]);
    chrome.declarativeNetRequest.addGenericRules(disableBlockingRule, 1); // disabling blocking for example.com

    const isBlockingEnabled = await trackerBlockingManager.isBlockingEnabledFor(
      "http://example.com/"
    );

    expect(isBlockingEnabled).toEqual(false);
  });

  test("should return true if blocking is enabled for domain", async () => {
    chrome.declarativeNetRequest.resetDynamicRules([]);

    const isBlockingEnabled = await trackerBlockingManager.isBlockingEnabledFor(
      "http://example.com/"
    );

    expect(isBlockingEnabled).toEqual(true);
  });
});
