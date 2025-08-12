// Toggle extension activation button UI
const toggleBtn = document.getElementById("toggle-extension");
toggleBtn.addEventListener("click", function () {
  this.classList.toggle("inactive");
  this.classList.toggle("active");
  this.textContent = this.classList.contains("inactive")
    ? "Activate"
    : "Deactivate";
});

// Slide-in/slide-out Blocked Trackers Panel
const showTrackersBtn = document.getElementById("show-trackers-btn");
const trackersPanel = document.getElementById("trackers-panel");
const closePanelBtn = document.getElementById("close-panel");

showTrackersBtn.addEventListener("click", function () {
  trackersPanel.classList.add("open");
});

closePanelBtn.addEventListener("click", function () {
  trackersPanel.classList.remove("open");
});

// Optional: Close panel on Escape key
document.addEventListener("keydown", function (e) {
  if (e.key === "Escape") {
    trackersPanel.classList.remove("open");
  }
});
