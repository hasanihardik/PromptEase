document.getElementById('saveKeyBtn').addEventListener('click', function () {
    const apiKey = document.getElementById('apiKeyInput').value;
  
    if (apiKey) {
      // Store the API key in Chrome storage
      chrome.storage.sync.set({ geminiApiKey: apiKey }, function () {
        document.getElementById('statusMessage').textContent = 'API key saved successfully!';
        
        // Clear the message after 3 seconds
        setTimeout(() => {
          document.getElementById('statusMessage').textContent = '';
        }, 3000);
      });
    } else {
      document.getElementById('statusMessage').textContent = 'Please enter a valid API key.';
    }
  });
  