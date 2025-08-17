import IdGenerator from "./idGenerator.js";
import ConflictError from "./error/conflictError.js";

class ExtensionService {
  constructor() {
    this.idGenerator = new IdGenerator();
  }

  async isBlockingEnabledFor(aUrl) {
    const existingRules = await this._getDynamicRules();
    const existingBlockingRulesId = this._getIdsOfExistingDisableBlockingRule(
      existingRules,
      aUrl
    );

    if (existingBlockingRulesId == null) {
      return true;
    }

    return false;
  }

  async enableBlockingForUrl(aUrl) {
    const existingRules = await this._getDynamicRules();
    const existingBlockingRulesId = this._getIdsOfExistingDisableBlockingRule(
      existingRules,
      aUrl
    );

    if (existingBlockingRulesId == null) {
      throw new ConflictError("url is already enabled");
    }

    const updateRuleOption = {
      removeRuleIds: existingBlockingRulesId,
    };

    this._updateDynamicRule(updateRuleOption);
    this._publishEnabledBlockingEventFor(aUrl);
  }

  async disableBlockingRuleForUrl(aUrl) {
    const existingRules = await this._getDynamicRules();

    if (this._hasNumberOfDynamicRuleReachLimit(existingRules)) {
      return;
    }

    if (
      this._getIdsOfExistingDisableBlockingRule(existingRules, aUrl) != null
    ) {
      throw new ConflictError("url is already disabled");
    }

    const id = this.idGenerator.generateId();

    const updateRuleOption = {
      addRules: [this._disablingBlockingRuleForUrl(aUrl, id)],
    };

    this._updateDynamicRule(updateRuleOption);
    this._publishDisabledBlockingEventFor(aUrl);
  }

  async _getDynamicRules() {
    return await chrome.declarativeNetRequest.getDynamicRules();
  }

  _hasNumberOfDynamicRuleReachLimit(rules) {
    if (rules.length == 5000) {
      return true;
    }

    return false;
  }

  _getIdsOfExistingDisableBlockingRule(rules, url) {
    const existingDisableBlockingRule = [];

    rules.forEach((rule) => {
      if (this._doesRuleDisableBlockingForUrl(rule, url)) {
        existingDisableBlockingRule.push(rule.id);
      }
    });

    if (existingDisableBlockingRule.length < 1) {
      return null;
    }

    return existingDisableBlockingRule;
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

  _disablingBlockingRuleForUrl(aUrl, anId) {
    const rule = {
      id: anId,
      priority: 100,
      action: {
        type: "allow",
      },
      condition: {
        urlFilter: "*",
        initiatorDomain: aUrl,
      },
    };

    return rule;
  }

  async _updateDynamicRule(anUpdateRuleOptions) {
    await chrome.declarativeNetRequest.updateDynamicRules(anUpdateRuleOptions);
  }

  _publishDisabledBlockingEventFor(aUrl) {
    chrome.runtime.sendMessage({
      action: "disabledBlocking",
      url: aUrl,
    });
  }

  _publishEnabledBlockingEventFor(aUrl) {
    chrome.runtime.sendMessage({
      action: "enabled",
      url: aUrl,
    });
  }
}

export default ExtensionService;
