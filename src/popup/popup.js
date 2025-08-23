import TrackerBlockingManager from "../applicationService/trackerBlockingManager.js";
import ConflictError from "../error/conflictError.js";

class VaylPopup {
  constructor() {
    this.trackerBlockingManager = new TrackerBlockingManager();
    this.isBlockingEnabled = true;
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

      if (this.isBlockingEnabled == true) {
        await this.trackerBlockingManager.disableBlockingForUrl(currentTab.url);
      } else {
        await this.trackerBlockingManager.enableBlockingForUrl(currentTab.url);
      }

      this.isBlockingEnabled = !this.isBlockingEnabled;

      this.updateUI();
      this.visualFeedback();
    } catch (error) {
      if (
        error instanceof ConflictError &&
        error.message == "blocking is already disabled"
      ) {
        this.isBlockingEnabled = !this.isBlockingEnabled;

        this.updateUI();
        this.visualFeedback();
        console.log(error.message);
      } else if (
        error instanceof ConflictError &&
        error.message == "blocking is already enabled"
      ) {
        this.isBlockingEnabled = !this.isBlockingEnabled;

        this.updateUI();
        this.visualFeedback();
        console.log(error.message);
      } else if (
        error instanceof ConflictError &&
        error.message == "dynamic rule has reach quota"
      ) {
        console.log(error.message);
      } else {
        console.log(error.message);
      }
    }
  }

  async loadState() {
    const currentTab = await this.retrieveCurrentTab();

    const enability = await this.trackerBlockingManager.isBlockingEnabledFor(
      currentTab.url
    );

    this.isBlockingEnabled = enability;
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
    if (this.isBlockingEnabled) {
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
      this.statusSubtitle.textContent =
        "Trackers are not being blocked on this site";
    }
  }

  visualFeedback() {
    this.toggleButton.style.transform = "scale(0.95)";
    setTimeout(() => {
      this.toggleButton.style.transform = "";
    }, 150);
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
