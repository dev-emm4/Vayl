// Mock Chrome APIs

class DeclarativeNetRequestAPI {
  constructor() {
    this.dynamicRules = [];
  }

  getDynamicRules() {
    return this.dynamicRules;
  }

  updateDynamicRules(anUpdateRuleOptions) {
    if ("removeRuleIds" in anUpdateRuleOptions) {
      const idOfRulesToRemove = anUpdateRuleOptions.removeRuleIds;

      this.dynamicRules = this.dynamicRules.filter(
        (rule) => !idOfRulesToRemove.includes(rule.id)
      );
    }

    if ("addRules" in anUpdateRuleOptions) {
      const newRules = anUpdateRuleOptions.addRules;
      this.dynamicRules.push(...newRules);
    }
  }

  resetDynamicRules(aDynamicRuleList) {
    this.dynamicRules = aDynamicRuleList;
  }

  addGenericRules(aRule, anAmount) {
    this.dynamicRules = [];

    for (let index = 0; index < anAmount; index++) {
      this.dynamicRules.push(aRule);
    }
  }
}

class RuntimeAPI {
  constructor() {
    this.event = null;
  }
  sendMessage(aMessage) {
    this.event = aMessage
  }

  getPublishedEvent() {
    return this.event;
  }

  resetEvent() {
    this.event = null;
  }
}

class Chrome {
  constructor() {
    this.declarativeNetRequest = new DeclarativeNetRequestAPI();
    this.runtime = new RuntimeAPI();
  }
}

global.chrome = new Chrome();
