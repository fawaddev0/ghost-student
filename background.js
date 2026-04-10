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
    // Set recording state to true
    await chrome.storage.local.set({ isRecording: true })

    // Fetch stream id to start transcription
    const streamId = await chrome.tabCapture.getMediaStreamId();
    const { deepgramApiKey } = await chrome.storage.local.get("deepgramApiKey");
    chrome.runtime.sendMessage({ type: "INIT", streamId, deepgramApiKey })
  }


  if (message.type === 'STOP_RECORDING') {
    chrome.runtime.sendMessage({ type: "STOP" })
    
    // Send transcription to n8n for generating and storing notes
    const existing = await chrome.storage.local.get("transcript");
    await fetch("https://n8n.fawad.live/webhook/generate-notes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ transcript: existing.transcript })
    })

    // Remove all data stored in storage
    await chrome.storage.local.remove(["isRecording", "transcript"]);
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


  /**
   * Send notification to my discord
   */
  if (message.type === "ATTENDANCE") {
    const result = await chrome.storage.local.get("discordWebhookUrl");
    if (result.discordWebhookUrl) {
      const response = await fetch(result.discordWebhookUrl, { 
        method: "POST", 
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: `🚨 **Attendance Alert!**` })
      })
    }
  }
})

