// Add styles for the floating result display
const style = document.createElement("style");
style.textContent = `
  .result {
    position: absolute;
    max-width: 300px;
    height: auto;
    background-color: white;
    border: 1px solid #ccc;
    border-radius: 5px;
    padding: 10px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    z-index: 10000;
    font-family: 'Courier New', monospace; /* Change font to a monospaced font for code */
    font-size: 14px;
    line-height: 1.4;
    color: black;
    white-space: pre-wrap; /* Preserve whitespace and line breaks */
    overflow-wrap: break-word; /* Break long words */
  }
  .result-close {
    position: absolute;
    top: 5px;
    right: 5px;
    cursor: pointer;
    font-size: 20px;
    color: black;
  }
`;
document.head.appendChild(style);

// Show the result near the selected text
function showFloatingResult(text) {
  // Remove previous result
  const existingResult = document.querySelector(".result");
  if (existingResult) {
    existingResult.remove();
  }

  const resultDiv = document.createElement("div");
  resultDiv.className = "result";
  resultDiv.innerHTML = `
    <div class="result-close">&times;</div>
    <pre>${text}</pre> <!-- Use <pre> to maintain formatting -->
  `;

  // Get selected text and position
  const selection = window.getSelection();
  const range = selection.getRangeAt(0);
  const rect = range.getBoundingClientRect();

  // Position the output near the selected text
  resultDiv.style.left = `${rect.left + window.scrollX}px`;
  resultDiv.style.top = `${rect.bottom + window.scrollY + 10}px`;

  document.body.appendChild(resultDiv);

  // Adjust position if the output goes off-screen
  const divRect = resultDiv.getBoundingClientRect();
  if (divRect.right > window.innerWidth) {
    resultDiv.style.left = `${window.innerWidth - divRect.width - 10}px`;
  }
  if (divRect.bottom > window.innerHeight) {
    resultDiv.style.top = `${rect.top + window.scrollY - divRect.height - 10}px`;
  }

  const closeButton = resultDiv.querySelector(".result-close");
  closeButton.addEventListener("click", () => {
    resultDiv.remove();
  });

  // Automatically remove the div after 10 seconds
  setTimeout(() => {
    resultDiv.remove();
  }, 10000);
}

// Listen for messages from background.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "showAlert") {
    showFloatingResult(request.text);
  }
});
