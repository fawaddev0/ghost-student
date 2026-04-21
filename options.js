// Save key
document.getElementById("save").addEventListener("click", async () => {
  const apiKey = document.getElementById("apiKey").value;
  const discordWebhookUrl = document.getElementById("discordWebhookUrl").value;
  await chrome.storage.local.set({ deepgramApiKey: apiKey, discordWebhookUrl: discordWebhookUrl });
  document.getElementById("status").textContent = "Saved!";
});

// Load existing key on page open
async function loadExistingApiKey() {
  const result = await chrome.storage.local.get("deepgramApiKey");
  const result2 = await chrome.storage.local.get("discordWebhookUrl");
  if (result.deepgramApiKey) {
    document.getElementById("apiKey").value = result.deepgramApiKey;
  }

  console.log(result2)

  if (result2.discordWebhookUrl) {
    document.getElementById("discordWebhookUrl").value = result2.discordWebhookUrl;
  }
}

loadExistingApiKey();
