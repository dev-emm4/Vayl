import ExtensionController from "../src/serviceWorkers/extensionController";

const extensionController = new ExtensionController();
let responseMsg = null;

describe("extensionController Test", () => {
  test("should successfully disable blocking for specified url", async () => {
    chrome.declarativeNetRequest.resetDynamicRules([]);

    const request = {
      initiatorUrl: "example.com",
    };

    await extensionController.disableBlocking(request, response);

    expect(responseMsg).toEqual({
      status: "success",
    });
  });

  test("should return an error if blocking rule is already disabled", async () => {
    chrome.declarativeNetRequest.resetDynamicRules([]);

    const request = {
      initiatorUrl: "example.com",
    };

    await extensionController.disableBlocking(request, response);
    await extensionController.disableBlocking(request, response);

    expect(responseMsg).toEqual({
      status: "error",
      message: "blocking is already disabled",
    });
  });

  test("should return an error if max dynamic rule quota is reached", async () => {
    const rule = createRule();

    chrome.declarativeNetRequest.resetDynamicRules([]);
    chrome.declarativeNetRequest.addGenericRules(rule, 5000);

    const request = {
      initiatorUrl: "example.com",
    };

    await extensionController.disableBlocking(request, response);

    expect(responseMsg).toEqual({
      status: "error",
      message: "dynamic rule has reach quota",
    });
  });

  test("should enable blocking for specified url", async () => {
    chrome.declarativeNetRequest.resetDynamicRules([]);

    const request = {
      initiatorUrl: "https:/example.com",
    };

    await extensionController.disableBlocking(request, response);
    await extensionController.enableBlocking(request, response);

    expect(responseMsg).toEqual({
      status: "success",
    });
  });

  test("should return error if blocking is already enabled for url", async () => {
    chrome.declarativeNetRequest.resetDynamicRules([]);

    const request = {
      initiatorUrl: "http:/example.com",
    };

    await extensionController.enableBlocking(request, response);

    expect(responseMsg).toEqual({
      status: "error",
      message: "blocking is already enabled",
    });
  });

  test("should return true", async () => {
    chrome.declarativeNetRequest.resetDynamicRules([]);

    const request = {
      initiatorUrl: "https:/example.com",
    };

    await extensionController.isBlockingEnabled(request, response);

    expect(responseMsg).toEqual({
      status: "success",
      enability: true,
    });
  });

  test("should return false", async () => {
    chrome.declarativeNetRequest.resetDynamicRules([]);

    const request = {
      initiatorUrl: "example.com",
    };

    await extensionController.disableBlocking(request, response);
    await extensionController.isBlockingEnabled(request, response);

    expect(responseMsg).toEqual({
      status: "success",
      enability: false,
    });
  });
});

function response(msg) {
  responseMsg = msg;
}

function createRule() {
  const rule = {
    id: 1,
    priority: 10,
    action: {
      type: "allow",
    },
    condition: {
      urlFilter: "*",
      initiatorDomains: ["example2.com"],
    },
  };

  return rule;
}
