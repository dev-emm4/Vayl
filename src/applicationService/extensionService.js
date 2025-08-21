import IdGenerator from "../utils/idGenerator.js";
import ConflictError from "../error/conflictError.js";

class ExtensionService {
  constructor() {
    this.idGenerator = new IdGenerator();
  }

  async isBlockingEnabledFor(aUrl) {
    const domain = this._extractDomain(aUrl);
    const existingRules = await this._getDynamicRules();
    const existingBlockingRulesId =
      this._idsOfExistingDisableBlockingRuleForDomain(existingRules, domain);

    if (existingBlockingRulesId == null) {
      return true;
    }

    return false;
  }

  async enableBlockingForUrl(aUrl) {
    const domain = this._extractDomain(aUrl);
    const existingRules = await this._getDynamicRules();
    const existingBlockingRulesId =
      this._idsOfExistingDisableBlockingRuleForDomain(existingRules, domain);

    if (existingBlockingRulesId == null) {
      throw new ConflictError("blocking is already enabled");
    }

    const updateRuleOption = {
      removeRuleIds: existingBlockingRulesId,
    };

    await this._updateDynamicRule(updateRuleOption);
  }

  async disableBlockingForUrl(aUrl) {
    const domain = this._extractDomain(aUrl);
    const existingRules = await this._getDynamicRules();

    if (this._hasNumberOfDynamicRuleHitMaxLimit(existingRules)) {
      throw new ConflictError("dynamic rule has reach quota");
    }

    if (
      this._idsOfExistingDisableBlockingRuleForDomain(existingRules, domain) !=
      null
    ) {
      throw new ConflictError("blocking is already disabled");
    }

    const id = this.idGenerator.generateId();

    const updateRuleOption = {
      addRules: [this._disablingBlockingRuleForDomain(domain, id)],
    };

    await this._updateDynamicRule(updateRuleOption);
  }

  _extractDomain(url) {
    try {
      return new URL(url).hostname;
    } catch (e) {
      // If URL is already just a domain, return as-is
      return url.replace(/^https?:\/\//, "").split("/")[0];
    }
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

  _idsOfExistingDisableBlockingRuleForDomain(aRules, aDomain) {
    const existingDisableBlockingRule = [];

    aRules.forEach((rule) => {
      if (this._isRuleDisablingBlockingForDomain(rule, aDomain)) {
        existingDisableBlockingRule.push(rule.id);
      }
    });

    if (existingDisableBlockingRule.length < 1) {
      return null;
    }

    return existingDisableBlockingRule;
  }

  _isRuleDisablingBlockingForDomain(aRule, aDomain) {
    if (aRule.priority != 100) {
      return false;
    }

    if (aRule.action.type != "allow") {
      return false;
    }

    if (aRule.condition.urlFilter != "*") {
      return false;
    }

    if (!("initiatorDomains" in aRule.condition)) {
      return false;
    }

    if (!aRule.condition.initiatorDomains.includes(aDomain)) {
      return false;
    }

    if (aRule.condition.initiatorDomains.length != 1) {
      return false;
    }

    if (aRule.condition.excludedInitiatorDomain != undefined) {
      return false;
    }

    return true;
  }

  _disablingBlockingRuleForDomain(aDomain, anId) {
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

  async _updateDynamicRule(anUpdateRuleOptions) {
    await chrome.declarativeNetRequest.updateDynamicRules(anUpdateRuleOptions);
  }
}

export default ExtensionService;
