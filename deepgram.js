export class DeepgramSocket {
  constructor() {
    this.ws = null;
    this.apiKey = null;
    this.transcripts = [];
  }

  /**
   * Set deepgram API Key
   */
  setApiKey(apiKey) {
    this.apiKey = apiKey;
  }

  /**
   * Connect to deepgram and attach event handlers
   */
  connect() {
    if (!this.apiKey) {
      throw new Error("[DEEPGRAM] API Key not provided")
    }

    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(
        "wss://api.deepgram.com/v1/listen?model=nova-3&language=multi&interim_results=true",
        ["token", this.apiKey]
      )

      this.ws.onopen = () => {
        console.log("[DEEPGRAM] Connected")
        resolve();
      }
      this.ws.onmessage = async (event) => await this.printAndSaveTranscript(event)
      this.ws.onclose = (ev) => console.log(`[DEEPGRAM] Disconnected. Code: ${ev.code}. Reason: ${ev.reason}`)
      this.ws.onerror = (err) => {
        console.log("[DEEPGRAM] Error: ", err)
        reject(err)
      }
    })

  }

  /**
   * Send audio chunks to deepgram WebSocket
   */
  send(data) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(data);
    }
  }

  /**
   * Print transcript on screen and save it in memory
   */
  async printAndSaveTranscript(event) {
    const result = JSON.parse(event.data);
    const transcript = result.channel?.alternatives?.[0]?.transcript;
    const isFinal = result.is_final;

    if (transcript) {
      if (isFinal) {
        console.log("[FINAL]", transcript);
        this.transcripts.push(transcript);
        this.flushToStorage();

        if (
          transcript.toLowerCase().includes("attendance") ||
          transcript.toLowerCase().includes("present") ||
          transcript.toLowerCase().includes("presentation") ||
          transcript.toLowerCase().includes("report") ||
          transcript.toLowerCase().includes("viva")
        ) {
          chrome.runtime.sendMessage({ type: "ATTENDANCE" })
        }

      } else {
        console.log("[INTERIM]", transcript); // updates as person speaks
      }
    }
  }

  /**
   * Store the trancripts from ``this.transcripts`` array in local storage
   */
  flushToStorage() {
    const transcriptSnapshot = this.transcripts;
    this.transcripts = [];
    chrome.runtime.sendMessage({ type: 'SAVE_TRANSCRIPT', transcriptSnapshot })
    console.log("[DEEPGRAM] Transcripts flushed to storage");
  }

  /**
   * Disconnect from deepgram WebSocket
   */
  disconnect() {
    this.ws.close();
  }
}
