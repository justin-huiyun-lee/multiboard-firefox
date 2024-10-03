// background.js

let prevClipboardText = "";
let clipboardCount = localStorage.getItem("clipboardCount") || 5;

// Periodically monitor the clipboard for changes (every 1 second)
setInterval(async function monitorClipboard() {
  try {
    const copiedText = await navigator.clipboard.readText();

    if (copiedText && copiedText !== prevClipboardText) {
      saveClipboards(copiedText); // Save the copied text
      prevClipboardText = copiedText;

      // Notify popup.js that clipboard history has changed
      browser.runtime.sendMessage({ type: "updateClipboard" });
    }
  } catch (error) {
    console.error("Error reading clipboard:", error);
  }
}, 1000); // 1000 milliseconds = 1 second

// Save clipboard text in localStorage and manage the history size
function saveClipboards(copiedText) {
  let clipboardHistory =
    JSON.parse(localStorage.getItem("clipboardHistory")) || [];

  clipboardHistory.push(copiedText);

  // Ensure we only keep the last `x` items (x = clipboardCount)
  clipboardHistory = manageClipboardStorage(clipboardHistory, clipboardCount);

  // Save the updated clipboard history back to localStorage
  localStorage.setItem("clipboardHistory", JSON.stringify(clipboardHistory));
}

// Manage clipboard storage by trimming excess entries beyond the last `x` items
function manageClipboardStorage(clipboardHistory, x) {
  // If the clipboard history exceeds the number `x`, remove the oldest entries
  if (clipboardHistory.length > x) {
    clipboardHistory = clipboardHistory.slice(-x); // Keep the last `x` items
  }
  return clipboardHistory;
}

// Handle messages from popup.js for clipboard count updates
browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "setClipboardCount") {
    clipboardCount = message.count;
    localStorage.setItem("clipboardCount", clipboardCount);
    sendResponse({ status: "clipboard count updated" });
  }
});
