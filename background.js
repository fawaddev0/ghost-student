// keeps service worker from going idle
chrome.runtime.onInstalled.addListener(() => {
  console.log('GhostStudent installed');
});

let mediaRecorder = null;
let audioChunks = [];

chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {

  if (message.type === 'START_RECORDING') {
    console.log("--- Recording Started ---")
    mediaRecorder = new MediaRecorder();
    mediaRecorder.start(60000)
  }

  if (message.type === "STOP_RECORDING") {
    console.log("--- Recording stopped ---")
    mediaRecorder.stop();
  }

});
