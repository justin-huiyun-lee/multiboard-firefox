document.addEventListener("DOMContentLoaded", function () {
  const firstTimeSetupDiv = document.getElementById("first-time-setup");
  const normalContentDiv = document.getElementById("normal-content");
  const saveClipboardCountBtn = document.getElementById("save-clipboard-count");
  const clipboardCountInput = document.getElementById("clipboard-count");
  const clipboardList = document.getElementById("clipboard-list");
  const historyLimitInput = document.getElementById("history-limit"); // New input for history limit
  const saveHistoryLimitBtn = document.getElementById("save-history-limit"); // New button to save limit

  // Check if the user has already set the clipboard count (first-time visit check)
  let clipboardCount = localStorage.getItem("clipboardCount");

  if (!clipboardCount) {
    firstTimeSetupDiv.style.display = "block"; // Show setup if clipboard count is not set
  } else {
    normalContentDiv.style.display = "block"; // Show normal content if clipboard count is set
    displayClipboardHistory(); // Display existing clipboard history

    // Set the value of history limit input from the stored clipboardCount
    historyLimitInput.value = clipboardCount;
  }

  // Handle saving the clipboard count from user input
  saveClipboardCountBtn.addEventListener("click", () => {
    const count = clipboardCountInput.value;

    if (count && count > 0) {
      clipboardCount = count;

      // Save clipboard count in localStorage
      localStorage.setItem("clipboardCount", clipboardCount);

      // Send clipboard count to background.js
      browser.runtime.sendMessage({ type: "setClipboardCount", count });

      // Hide setup and show normal content
      firstTimeSetupDiv.style.display = "none";
      normalContentDiv.style.display = "block";
    } else {
      alert("Please enter a valid number of clipboards.");
    }
  });

  // Function to display the clipboard history in the HTML list
  function displayClipboardHistory() {
    // Get clipboard history from localStorage
    const clipboardHistory =
      JSON.parse(localStorage.getItem("clipboardHistory")) || [];

    // Clear the current list to refresh it
    clipboardList.innerHTML = "";
    clipboardList.classList.add("clipboard-list");

    // Add each clipboard item as a list element
    clipboardHistory.forEach((item) => {
      const listItem = document.createElement("li");
      listItem.classList.add("copied-item");

      const listItemContainer = document.createElement("div");
      listItemContainer.classList.add("list-item-container");

      const text = document.createElement("p");
      text.textContent = item;
      text.classList.add("copied-text");

      const container = document.createElement("div");
      container.classList.add("button-container");

      const textContainer = document.createElement("div");
      textContainer.classList.add("text-container");
      textContainer.appendChild(text);

      const copyButton = document.createElement("button");
      copyButton.textContent = "Copy";
      copyButton.classList.add("button-2");
      copyButton.addEventListener("click", () => {
        navigator.clipboard.writeText(item);
      });

      const deleteButton = document.createElement("button");
      deleteButton.textContent = "Delete";
      deleteButton.classList.add("button-2");
      deleteButton.addEventListener("click", () => {
        const updatedClipboardHistory = clipboardHistory.filter(
          (historyItem) => historyItem !== item,
        );

        localStorage.setItem(
          "clipboardHistory",
          JSON.stringify(updatedClipboardHistory),
        );

        displayClipboardHistory();
      });

      textContainer.appendChild(text);
      container.appendChild(copyButton);
      container.appendChild(deleteButton);
      listItemContainer.appendChild(textContainer);
      listItemContainer.appendChild(container);
      listItem.appendChild(listItemContainer);

      prevClipboardText = item;
      clipboardList.appendChild(listItem);
    });
  }

  // Listen for clipboard updates from background.js
  browser.runtime.onMessage.addListener((message) => {
    if (message.type === "updateClipboard") {
      displayClipboardHistory(); // Refresh the clipboard history when notified
    }
  });

  // Handle updating the clipboard history limit
  saveHistoryLimitBtn.addEventListener("click", () => {
    const newLimit = historyLimitInput.value;

    if (newLimit && newLimit > 0) {
      // Update clipboard count in localStorage
      localStorage.setItem("clipboardCount", newLimit);

      // Send the new limit to background.js
      browser.runtime.sendMessage({
        type: "setClipboardCount",
        count: newLimit,
      });

      alert(`Clipboard history limit updated to ${newLimit}`);
    } else {
      alert("Please enter a valid number for the history limit.");
    }
  });
});
