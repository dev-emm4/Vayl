import IdGenerator from "./idGenerator";

class ExtensionController {
  constructor() {
    this.idGenerator = new IdGenerator();
  }
  async deActivateBlockerForUrl(url) {
    try {
      const rules = await this._getDynamicRules();
    } catch (error) {
      console.error("Error deactivating blocker for URL:", error);
    }
  }

  _getDynamicRules() {
    return chrome.declarativeNetRequest.getDynamicRules();
  }
}
