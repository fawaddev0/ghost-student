const btnStart = document.getElementById('btnStart');
const btnStop = document.getElementById('btnStop');
const status = document.getElementById('status');

btnStart.addEventListener('click', () => {
  // wake up the service worker first, then send message
  chrome.runtime.sendMessage({ type: 'START_RECORDING' }, (res) => {
    if (chrome.runtime.lastError) {
      console.log('Error:', chrome.runtime.lastError.message);
      return;
    }
    status.textContent = 'RECORDING — capturing audio';
    status.classList.add('active');
    btnStart.disabled = true;
    btnStop.disabled = false;
  });
});

btnStop.addEventListener('click', () => {
  chrome.runtime.sendMessage({ type: 'STOP_RECORDING' }, (res) => {
    if (chrome.runtime.lastError) {
      console.log('Error:', chrome.runtime.lastError.message);
      return;
    }
    status.textContent = 'IDLE — ready to record';
    status.classList.remove('active');
    btnStart.disabled = false;
    btnStop.disabled = true;
  });
});
