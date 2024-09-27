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
    // Get the API key from storage
    chrome.storage.sync.get("geminiApiKey", function (data) {
      if (data.geminiApiKey) {
        const apiKey = data.geminiApiKey;
        const isMCQ = info.menuItemId === "SolveMCQ";
        generateResponse(info.selectionText, apiKey, isMCQ)
          .then((response) => {
            chrome.scripting.executeScript(
              {
                target: { tabId: tab.id },
                files: ["content.js"],
              },
              () => {
                chrome.tabs.sendMessage(tab.id, {
                  action: "showAlert",
                  text: isMCQ ? "Correct answer: " + response : response,
                  isMCQ: isMCQ
                });
              }
            );
          })
          .catch((error) => {
            console.error("Error generating response:", error);
            chrome.scripting.executeScript(
              {
                target: { tabId: tab.id },
                files: ["content.js"],
              },
              () => {
                chrome.tabs.sendMessage(tab.id, {
                  action: "showAlert",
                  text: "An error occurred: " + error.message,
                  isMCQ: false
                });
              }
            );
          });
      } else {
        console.error("API key is not configured.");
      }
    });
  }
});

async function generateResponse(text, apiKey, isMCQ) {
  const url = `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${apiKey}`;

  const prompt = isMCQ
    ? `For the following MCQ, provide correct answer : ${text}`
    : `Just give the program: ${text}. No comments, no explanation.`;

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