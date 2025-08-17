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

      this.dynamicRules.forEach((rule, index) => {
        if (idOfRulesToRemove.includes(rule.id)) {
          this.dynamicRules.splice(index, 1);
        }
      });
    }

    if ("addRules" in anUpdateRuleOptions) {
      const newRules = anUpdateRuleOptions.addRules;
      this.dynamicRules.push(...newRules);
    }
  }

  resetDynamicRules(aDynamicRuleList) {
    this.dynamicRules = aDynamicRuleList;
  }
}

class RuntimeAPI {
  sendMessage(aMessage) {
    console.log(aMessage);
  }
}

class Chrome {
  constructor() {
    this.declarativeNetRequest = new DeclarativeNetRequestAPI();
    this.runtime = new RuntimeAPI();
  }
}

global.chrome = new Chrome();
