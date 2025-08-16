class IdGenerator {
  constructor() {
    (this.dynamicRulesRanges = { start: 30001, end: 35000 }),
      (this.sessionRulesRanges = { start: 35001, end: 40000 });
  }

  newDynamicRuleId(anId) {
    if (anId < this.dynamicRulesRanges.start) {
      return 30001;
    }

    this._throwErrorIfDynamicRulesIsMaxOut(anId);

    return anId + 1;
  }

  _throwErrorIfDynamicRulesIsMaxOut(anId) {
    if (anId == this.dynamicRulesRanges.end) {
      throw new Error("dynamic is maxed out");
    }

    return;
  }
}

export default IdGenerator;
