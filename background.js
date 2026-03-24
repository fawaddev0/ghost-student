console.log("Background.js loaded")

// Setup the extension - load offscreen file and deepgram api key
chrome.offscreen.hasDocument().then(async(existing) => {
  if (existing) {
    console.log("Offscreen page already exists")
  } else {
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
    const { deepgramApiKey } = await chrome.storage.local.get("deepgramApiKey");
    console.log(deepgramApiKey)
    chrome.runtime.sendMessage({ type: "INIT", streamId, deepgramApiKey })
  }


  if (message.type === 'STOP_RECORDING') {
    chrome.runtime.sendMessage({ type: "STOP" })
  }

  if (message.type === 'SAVE_TRANSCRIPT') {
    const existing = await chrome.storage.local.get("transcript");
    const prev = existing.transcript || "";
    console.log("[STORAGE] Previous: ", prev);
    
    await chrome.storage.local.set({ 
      transcript: prev + " " + message.transcriptSnapshot.join(" ")
    });
    console.log("[STORAGE] Transcript saved")
  }
});

