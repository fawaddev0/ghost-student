
console.log("Offscreen document loaded")

let mediaRecorder = null;
let chunks = [];

chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  if (message.type === "INIT") {
    console.log("--- Recording Initiated ---")
    startRecording(message.streamId)
  }

  if (message.type === "STOP") {
    console.log("--- Recording stopped ---")
    stopRecording();
  }
})


/**
 * Get tab audio and start recording it using MediaRecorder API
 */
async function startRecording(streamId) {
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: {
      mandatory: {
        chromeMediaSource: 'tab',
        chromeMediaSourceId: streamId
      }
    },
    video: false
  });

  // Setup media recorder
  mediaRecorder = new MediaRecorder(stream);
  mediaRecorder.start(5000); // Split the audio in 5 second chunks, this invokes the "ondataavailable" event
  console.log("--- Recording Started ---")

  // Listen to the audio and save it in chunks of 5 seconds
  mediaRecorder.ondataavailable = (e) => {
    chunks.push(e.data)
    console.log("New chunk added, total:", chunks.length)
  }
}

// Save audio file on recording stop
async function stopRecording() {
  // Stop media recorder
  mediaRecorder.stop();

  // Download audio
  mediaRecorder.onstop = () => {
    const blob = new Blob(chunks, { type: mediaRecorder.mimeType })
    console.log("Blob size:", blob.size)

    const audioUrl = window.URL.createObjectURL(blob);
    const a = document.createElement("a")
    a.href = audioUrl;
    a.download = `lecture_${Date.now()}.webm`;
    a.click()
    URL.revokeObjectURL(audioUrl)
  }
}



