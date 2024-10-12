chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "PromptEase",
    title: "SolveProgram",
    contexts: ["selection"],
  });
  chrome.contextMenus.create({
    id: "SolveMCQ",
    title: "Solve MCQ",
    contexts: ["selection"],
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if ((info.menuItemId === "PromptEase" || info.menuItemId === "SolveMCQ") && info.selectionText) {
    handleSolveRequest(info.menuItemId, info.selectionText, tab);
  }
});

chrome.commands.onCommand.addListener((command, tab) => {
  switch (command) {
    case "solve_program":
    case "solve_mcq":
      chrome.tabs.sendMessage(tab.id, { action: "getSelectedText" }, (response) => {
        if (response && response.selectedText) {
          handleSolveRequest(command === "solve_program" ? "PromptEase" : "SolveMCQ", response.selectedText, tab);
        }
      });
      break;
    case "custom_copy":
      chrome.tabs.sendMessage(tab.id, { action: "getSelectedText" }, (response) => {
        if (response && response.selectedText) {
          chrome.storage.sync.set({ customCopyText: response.selectedText });
        }
      });
      break;
    case "custom_paste":
      chrome.storage.sync.get("customCopyText", (data) => {
        if (data.customCopyText) {
          chrome.tabs.sendMessage(tab.id, {
            action: "customPaste",
            text: data.customCopyText,
          });
        }
      });
      break;
  }
});

function handleSolveRequest(action, text, tab) {
  chrome.storage.sync.get("geminiApiKey", function (data) {
    if (data.geminiApiKey) {
      const apiKey = data.geminiApiKey;
      const isMCQ = action === "SolveMCQ";
      generateResponse(text, apiKey, isMCQ)
        .then((response) => {
          chrome.tabs.sendMessage(tab.id, {
            action: "showAlert",
            text: isMCQ ? "Correct answer: " + response : response,
            isMCQ: isMCQ
          });
        })
        .catch((error) => {
          console.error("Error generating response:", error);
          chrome.tabs.sendMessage(tab.id, {
            action: "showAlert",
            text: "An error occurred: " + error.message,
            isMCQ: false
          });
        });
    } else {
      console.error("API key is not configured.");
    }
  });
}

async function generateResponse(text, apiKey, isMCQ) {
  const url = `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${apiKey}`;
  const prompt = isMCQ
    ? `For the following MCQ, provide correct answer : ${text}`
    : `Just give the Java program: ${text}. No comments, no explanation.`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }],
        },
      ],
    }),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(
      `HTTP error! status: ${response.status}, message: ${JSON.stringify(errorData)}`
    );
  }
  const data = await response.json();
  return data.candidates[0].content.parts[0].text;
}