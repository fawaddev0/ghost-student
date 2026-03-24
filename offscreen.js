import { DeepgramSocket } from "./deepgram.js"

console.log("Offscreen document loaded")

let mediaRecorder = null;
const ws = new DeepgramSocket();

chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  if (message.type === "INIT") {
    console.log("--- Recording Initiated ---")
    console.log(message)
    if (!message.deepgramApiKey) {
      return alert("Please provide your deepgram api key via settings")
    }
    ws.setApiKey(message.deepgramApiKey)
    ws.connect();
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

  // Create a new media stream to keep playing audio in the tab,
  // because when you start the extension he tab audio is captured by the extension
  // and the audio is no longer audible for the user.
  const audioContext = new AudioContext();
  const source = audioContext.createMediaStreamSource(stream);
  source.connect(audioContext.destination);

  // Setup media recorder
  mediaRecorder = new MediaRecorder(stream);
  mediaRecorder.start(1000);

  // Listen to the audio and stream it to deepgram
  mediaRecorder.ondataavailable = (e) => {
    ws.send(e.data)
  }
}

// Save audio file on recording stop
async function stopRecording() {
  mediaRecorder.stop();
  mediaRecorder.stream.getTracks().forEach(track => track.stop());

  mediaRecorder.onstop = () => {
    ws.disconnect();
  }
}


