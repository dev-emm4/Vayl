import IdGenerator from "./idGenerator";

class ExtensionController {
  constructor() {
    this.idGenerator = new IdGenerator();
  }
  async deActivateBlockingForUrl(url) {
    try {
      const rules = await this._getDynamicRules();

      if (this._hasNumberOfDynamicRuleReachItQuota) {
        return;
      }

      if (this._getIdOfDisablingBlockingRuleForUrl(rules, url) != null) {
        return;
      }

      const id = this.idGenerator.generateId();
      const disablingBlockingRule = this._disablingBlockingRuleForUrl(url, id);
    } catch (error) {
      console.error("Error deactivating blocker for URL:", error);
    }
  }

  _getDynamicRules() {
    return chrome.declarativeNetRequest.getDynamicRules();
  }

  _hasNumberOfDynamicRuleReachItQuota(rules) {
    if (rules.length == 5000) {
      return true;
    }

    return false;
  }

  _getIdOfDisablingBlockingRuleForUrl(rules, url) {
    rules.forEach((rule) => {
      if (this._doesRuleDisableBlockingForUrl(rule, url)) {
        return rule.id;
      }
    });

    return null;
  }

  _disablingBlockingRuleForUrl(aUrl, anId) {
    rule = {
      id: anId,
      priority: 100,
      action: {
        type: "block",
      },
      condition: {
        urlFilter: "*",
        initiatorDomain: aUrl,
      },
    };

    return rule;
  }

  _doesRuleDisableBlockingForUrl(rule, url) {
    if (rule.priority != 100) {
      return false;
    }

    if (rule.action.type != "allow") {
      return false;
    }

    if (rule.condition.urlFilter != "*") {
      return false;
    }

    if (rule.condition.initiatorDomain != url) {
      return false;
    }

    if (rule.condition.excludedInitiatorDomain != undefined) {
      return false;
    }

    return true;
  }
}
