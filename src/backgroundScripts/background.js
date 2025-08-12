// Log when rules match (for debugging)
chrome.declarativeNetRequest.onRuleMatchedDebug.addListener((info) => {
  console.log("Rule matched:", info);
});

// Log when extension starts
console.log("DeclarativeNetRequest test extension loaded");

// Optional: Check what rules are active
chrome.declarativeNetRequest.getEnabledRulesets((rulesets) => {
  console.log("Enabled rulesets:", rulesets);
});
