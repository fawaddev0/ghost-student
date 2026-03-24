export class DeepgramSocket {
  constructor(apiKey) {
    this.ws = null;
    this.apiKey = apiKey;
    this.transcripts = [];
  }

  /**
   * Connect to deepgram and attach event handlers
   */
  connect() {
    this.ws = new WebSocket(
      "wss://api.deepgram.com/v1/listen?model=nova-3&language=ur&interim_results=true",
      ["token", this.apiKey]
    )

    this.ws.onopen = () => console.log("[DEEPGRAM] Connected")
    this.ws.onmessage = async (event) => await this.printAndSaveTranscript(event)
    this.ws.onclose = () => console.log("[DEEPGRAM] Disconnected")
    this.ws.onerror = (err) => console.log("[DEEPGRAM] Error: ", err)
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
        await this.flushToStorage();
      } else {
        console.log("[INTERIM]", transcript); // updates as person speaks
      }
    }
  }

  /**
   * Store the trancripts from ``this.transcripts`` array in local storage
   */
  async flushToStorage() {
    const transcriptSnapshot = this.transcripts;
    this.transcripts = [];

    const existing = await chrome.storage.local.get("transcript");
    const prev = existing.transcript || "";
    
    await chrome.storage.local.set({ 
      transcript: prev + " " + transcriptSnapshot.join(" ")
    });
    
    console.log("[DEEPGRAM] Transcripts flushed to storage");
  }

  /**
   * Disconnect from deepgram WebSocket
   */
  disconnect() {
    this.ws.close();
  }
}
