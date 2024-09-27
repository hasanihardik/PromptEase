const style = document.createElement("style");
style.textContent = `
  .result {
    position: fixed;
    max-width: 300px;
    height: auto;
    background-color: black;
    border: 1px solid #ccc;
    border-radius: 5px;
    padding: 10px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    z-index: 10000;
    font-family: Arial, sans-serif;
    font-size: 14px;
    line-height: 1.4;
    color: white;
    white-space: pre-wrap;
    overflow-wrap: break-word;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
  }
`;
document.head.appendChild(style);

function showFloatingResult(text, isMCQ = false) {
  const existingResult = document.querySelector(".result");
  if (existingResult) {
    existingResult.remove();
  }
  
  const resultDiv = document.createElement("div");
  resultDiv.className = "result";
  resultDiv.textContent = text;
  
  document.body.appendChild(resultDiv);
  if (!isMCQ) {
    navigator.clipboard.writeText(text).then(() => {
      console.log("Text copied to clipboard");
    }).catch(err => {
      console.error("Failed to copy text: ", err);
    });
    setTimeout(() => {
      resultDiv.remove();
    }, 1);
  }
  if(isMCQ){
    setTimeout(() => {
      resultDiv.remove();
    }, 5000);
  }
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "showAlert") {
    showFloatingResult(request.text, request.isMCQ);
  } else if (request.action === "getSelectedText") {
    sendResponse({ selectedText: window.getSelection().toString() });
  } else if (request.action === "customPaste") {
    const activeElement = document.activeElement;
    if (activeElement.tagName === 'TEXTAREA' || activeElement.tagName === 'INPUT') {
      const start = activeElement.selectionStart;
      const end = activeElement.selectionEnd;
      activeElement.value = activeElement.value.substring(0, start) + request.text + activeElement.value.substring(end);
      activeElement.selectionStart = activeElement.selectionEnd = start + request.text.length;
    } else if (activeElement.isContentEditable) {
      document.execCommand('insertText', false, request.text);
    }
  }
});