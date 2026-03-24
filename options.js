// Save key
document.getElementById("save").addEventListener("click", async () => {
  const apiKey = document.getElementById("apiKey").value;
  await chrome.storage.local.set({ deepgramApiKey: apiKey });
  document.getElementById("status").textContent = "Saved!";
});

// Load existing key on page open
async function loadExistingApiKey() {
  const result = await chrome.storage.local.get("deepgramApiKey");
  if (result.deepgramApiKey) {
    document.getElementById("apiKey").value = result.deepgramApiKey;
  }
}

loadExistingApiKey();
