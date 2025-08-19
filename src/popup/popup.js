class VaylPopup {
  constructor() {
    this.isEnabled = true;
    this.init();
  }

  async init() {
    this.toggleButton = document.getElementById("toggleButton");
    this.statusIndicator = document.getElementById("statusIndicator");
    this.statusIcon = document.getElementById("statusIcon");
    this.statusText = document.getElementById("statusText");
    this.statusSubtitle = document.getElementById("statusSubtitle");

    this.toggleButton.addEventListener("click", () => this.toggle());

    // Load saved state
    await this.loadState();
    this.updateUI();
    this.setupInteractiveEffects();
  }

  async toggle() {
    try {
      const currentTab = await this.retrieveCurrentTab();
      const message = {
        action: this.isEnabled ? "disableBlocking" : "enableBlocking",
        url: currentTab.url,
      };

      await chrome.runtime.sendMessage(message);

      this.isEnabled = !this.isEnabled;
      this.updateUI();

      // Add visual feedback
      this.toggleButton.style.transform = "scale(0.95)";
      setTimeout(() => {
        this.toggleButton.style.transform = "";
      }, 150);
    } catch (error) {
      console.log("");
    }
  }

  async loadState() {
    const currentTab = await this.retrieveCurrentTab();
    const message = {
      action: "isRuleEnabled",
      url: currentTab.url,
    };
    console.log(currentTab.url);

    const response = await chrome.runtime.sendMessage(message);
    this.isEnabled = response.enability;
  }

  async retrieveCurrentTab() {
    const tabs = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });
    const currentTab = tabs[0];

    return currentTab;
  }

  updateUI() {
    if (this.isEnabled) {
      // Enabled state
      this.toggleButton.textContent = "Disable Protection";
      this.toggleButton.className = "toggle-button enabled";
      this.statusIndicator.className = "status-indicator enabled pulse";
      this.statusIcon.textContent = "🛡️";
      this.statusText.textContent = "Protection Active";
      this.statusSubtitle.textContent =
        "Blocking trackers and protecting your privacy";
    } else {
      // Disabled state
      this.toggleButton.textContent = "Enable Protection";
      this.toggleButton.className = "toggle-button disabled";
      this.statusIndicator.className = "status-indicator disabled";
      this.statusIcon.textContent = "⚠️";
      this.statusText.textContent = "Protection Disabled";
      this.statusSubtitle.textContent = "Trackers are not being blocked";
    }
  }

  setupInteractiveEffects() {
    // Add hover effects to status indicator
    this.statusIndicator.addEventListener("mouseenter", () => {
      this.statusIndicator.style.transform = "scale(1.05)";
    });

    this.statusIndicator.addEventListener("mouseleave", () => {
      this.statusIndicator.style.transform = "scale(1)";
    });
  }
}

// Initialize the popup when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  new VaylPopup();
});
