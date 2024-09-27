// Add styles for the floating result display
const style = document.createElement("style");
style.textContent = `
  .result {
    position: fixed; /* Change to fixed for centering */
    max-width: 500px; /* Increase width */
    height: auto;
    background-color: white;
    border: 1px solid #ccc;
    border-radius: 5px;
    padding: 20px; /* Increased padding for better layout */
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    z-index: 10000;
    font-family: 'Courier New', monospace; /* Change font to a monospaced font for code */
    font-size: 16px; /* Increase font size */
    line-height: 1.4;
    color: black;
    white-space: pre-wrap; /* Preserve whitespace and line breaks */
    overflow-wrap: break-word; /* Break long words */
    left: 50%; /* Center horizontally */
    top: 50%; /* Center vertically */
    transform: translate(-50%, -50%); /* Centering adjustment */
  }
  .result-close {
    position: absolute;
    top: 5px;
    right: 5px;
    cursor: pointer;
    font-size: 20px;
    color: black;
  }
  .copy-button {
    margin-top: 10px;
    cursor: pointer;
    padding: 5px 10px;
    background-color: #007BFF;
    color: white;
    border: none;
    border-radius: 5px;
    font-size: 14px;
  }
`;
document.head.appendChild(style);

// Show the result in a fixed position at the center of the page
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
    <button class="copy-button">Copy to Clipboard</button>
  `;

  document.body.appendChild(resultDiv);

  // Copy text to clipboard functionality
  const copyButton = resultDiv.querySelector(".copy-button");
  copyButton.addEventListener("click", () => {
    navigator.clipboard.writeText(text).then(() => {
      alert("Text copied to clipboard!");
    }).catch(err => {
      console.error("Failed to copy text: ", err);
    });
  });

  const closeButton = resultDiv.querySelector(".result-close");
  closeButton.addEventListener("click", () => {
    resultDiv.remove();
  });

  // Automatically remove the div after 20 seconds
  setTimeout(() => {
    resultDiv.remove();
  }, 20000);
}

// Listen for messages from background.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "showAlert") {
    showFloatingResult(request.text);
  }
});
