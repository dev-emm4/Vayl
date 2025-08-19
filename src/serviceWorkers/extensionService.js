import IdGenerator from "../utils/idGenerator.js";
import ConflictError from "../error/conflictError.js";

class ExtensionService {
  constructor() {
    this.idGenerator = new IdGenerator();
  }

  async isBlockingEnabledFor(aUrl) {
    const domain = this._extractDomain(aUrl);
    const existingRules = await this._getDynamicRules();
    const existingBlockingRulesId = this._getIdsOfExistingDisableBlockingRule(
      existingRules,
      domain
    );

    if (existingBlockingRulesId == null) {
      return true;
    }

    return false;
  }

  async enableBlockingForUrl(aUrl) {
    const domain = this._extractDomain(aUrl);
    const existingRules = await this._getDynamicRules();
    const existingBlockingRulesId = this._getIdsOfExistingDisableBlockingRule(
      existingRules,
      domain
    );

    if (existingBlockingRulesId == null) {
      throw new ConflictError("blocking is already enabled");
    }

    const updateRuleOption = {
      removeRuleIds: existingBlockingRulesId,
    };

    await this._updateDynamicRule(updateRuleOption);
    this._publishEvent({
      action: "enabledBlocking",
      domain: domain,
    });
  }

  async disableBlockingRuleForUrl(aUrl) {
    const domain = this._extractDomain(aUrl);
    const existingRules = await this._getDynamicRules();

    if (this._hasNumberOfDynamicRuleHitMaxLimit(existingRules)) {
      throw new ConflictError("dynamic rule has reach quota");
    }

    if (
      this._getIdsOfExistingDisableBlockingRule(existingRules, domain) != null
    ) {
      throw new ConflictError("blocking is already disabled");
    }

    const id = this.idGenerator.generateId();

    const updateRuleOption = {
      addRules: [this._disablingBlockingRuleForUrl(domain, id)],
    };

    await this._updateDynamicRule(updateRuleOption);
    await this._publishEvent({
      action: "disabledBlocking",
      domain: domain,
    });
  }

  async _getDynamicRules() {
    return await chrome.declarativeNetRequest.getDynamicRules();
  }

  _hasNumberOfDynamicRuleHitMaxLimit(rules) {
    if (rules.length >= 5000) {
      return true;
    }

    return false;
  }

  _getIdsOfExistingDisableBlockingRule(aRules, aDomain) {
    const existingDisableBlockingRule = [];

    aRules.forEach((rule) => {
      if (this._doesRuleDisableBlockingForDomain(rule, aDomain)) {
        existingDisableBlockingRule.push(rule.id);
      }
    });

    if (existingDisableBlockingRule.length < 1) {
      return null;
    }

    return existingDisableBlockingRule;
  }

  _doesRuleDisableBlockingForDomain(aRule, aDomain) {
    if (aRule.priority != 100) {
      return false;
    }

    if (aRule.action.type != "allow") {
      return false;
    }

    if (aRule.condition.urlFilter != "*") {
      return false;
    }

    if (aRule.condition.initiatorDomains.length != 1) {
      return false;
    }

    if (!aRule.condition.initiatorDomains.includes(aDomain)) {
      return false;
    }

    if (aRule.condition.excludedInitiatorDomain != undefined) {
      return false;
    }

    return true;
  }

  _disablingBlockingRuleForUrl(aDomain, anId) {
    const rule = {
      id: anId,
      priority: 100,
      action: {
        type: "allow",
      },
      condition: {
        urlFilter: "*",
        initiatorDomains: [aDomain],
      },
    };

    return rule;
  }

  _extractDomain(url) {
    try {
      return new URL(url).hostname;
    } catch (e) {
      // If URL is already just a domain, return as-is
      return url.replace(/^https?:\/\//, "").split("/")[0];
    }
  }

  async _updateDynamicRule(anUpdateRuleOptions) {
    await chrome.declarativeNetRequest.updateDynamicRules(anUpdateRuleOptions);
  }

  async _publishEvent(aMessage) {
    await chrome.runtime.sendMessage(aMessage);
  }
}

export default ExtensionService;
