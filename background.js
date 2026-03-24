console.log("Background.js loaded")

let apiKey = null;

// Setup the extension - load offscreen file and deepgram api key
chrome.offscreen.hasDocument().then(async(existing) => {
  if (existing) {
    console.log("Offscreen page already exists")
  } else {
    const { deepgramApiKey } = await chrome.storage.local.get("deepgramApiKey");
    apiKey = deepgramApiKey;

    await chrome.offscreen.createDocument({
      url: 'offscreen.html',
      reasons: ['USER_MEDIA'], // Or other reasons
      justification: 'Playing notification sounds' // Explain why you need it
    });
  }
})

chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  if (message.type === 'START_RECORDING') {
    const streamId = await chrome.tabCapture.getMediaStreamId();
    chrome.runtime.sendMessage({ type: "INIT", streamId, deepgramApiKey: apiKey })
  }


  if (message.type === 'STOP_RECORDING') {
    chrome.runtime.sendMessage({ type: "STOP" })
  }
});

