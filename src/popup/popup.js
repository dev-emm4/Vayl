class VaylPopup {
    constructor() {
        this.isEnabled = true;
        this.init();
    }

    init() {
        this.toggleButton = document.getElementById('toggleButton');
        this.statusIndicator = document.getElementById('statusIndicator');
        this.statusIcon = document.getElementById('statusIcon');
        this.statusText = document.getElementById('statusText');
        this.statusSubtitle = document.getElementById('statusSubtitle');

        this.toggleButton.addEventListener('click', () => this.toggle());
        
        // Load saved state (in real extension, this would come from chrome.storage)
        this.loadState();
        this.updateUI();
        this.setupInteractiveEffects();
    }

    toggle() {
        this.isEnabled = !this.isEnabled;
        this.updateUI();
        this.saveState();
        
        // Add visual feedback
        this.toggleButton.style.transform = 'scale(0.95)';
        setTimeout(() => {
            this.toggleButton.style.transform = '';
        }, 150);

        // In a real extension, you would call your blocking function here
        // chrome.runtime.sendMessage({action: 'toggleBlocking', enabled: this.isEnabled});
    }

    updateUI() {
        if (this.isEnabled) {
            // Enabled state
            this.toggleButton.textContent = 'Disable Protection';
            this.toggleButton.className = 'toggle-button enabled';
            this.statusIndicator.className = 'status-indicator enabled pulse';
            this.statusIcon.textContent = '🛡️';
            this.statusText.textContent = 'Protection Active';
            this.statusSubtitle.textContent = 'Blocking trackers and protecting your privacy';
        } else {
            // Disabled state
            this.toggleButton.textContent = 'Enable Protection';
            this.toggleButton.className = 'toggle-button disabled';
            this.statusIndicator.className = 'status-indicator disabled';
            this.statusIcon.textContent = '⚠️';
            this.statusText.textContent = 'Protection Disabled';
            this.statusSubtitle.textContent = 'Trackers are not being blocked';
        }
    }

    saveState() {
        // In a real extension, save to chrome.storage.local
        localStorage.setItem('vayl-enabled', JSON.stringify(this.isEnabled));
    }

    loadState() {
        // In a real extension, load from chrome.storage.local
        const saved = localStorage.getItem('vayl-enabled');
        if (saved !== null) {
            this.isEnabled = JSON.parse(saved);
        }
    }

    setupInteractiveEffects() {
        // Add hover effects to status indicator
        this.statusIndicator.addEventListener('mouseenter', () => {
            this.statusIndicator.style.transform = 'scale(1.05)';
        });
        
        this.statusIndicator.addEventListener('mouseleave', () => {
            this.statusIndicator.style.transform = 'scale(1)';
        });
    }
}

// Initialize the popup when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new VaylPopup();
});