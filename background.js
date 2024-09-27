const API_KEY = "your-api-key";

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "PromptEase",
    title: "PromptEase",
    contexts: ["selection"],
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "PromptEase" && info.selectionText) {
    generateResponse(info.selectionText)
      .then((response) => {
        chrome.scripting.executeScript(
          {
            target: { tabId: tab.id },
            files: ["content.js"],
          },
          () => {
            chrome.tabs.sendMessage(tab.id, {
              action: "showResponse",
              text: response,
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
              action: "showResponse",
              text:
                "An error occurred while generating the response: " +
                error.message,
            });
          }
        );
      });
  }
});

async function generateResponse(text) {
  const url = `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${API_KEY}`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      contents: [
        {
          role: "user",
          parts: [{ text: `Explain: ${text} in one sentence` }],
        },
      ],
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(
      `HTTP error! status: ${response.status}, message: ${JSON.stringify(
        errorData
      )}`
    );
  }

  const data = await response.json();
  return data.candidates[0].content.parts[0].text;
}
