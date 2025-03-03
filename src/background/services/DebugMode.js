const KEY = 'debug_mode';

async function DebugMode() {
  const debug_mode = await chrome.storage.local.get(KEY);

  return debug_mode;
}

export default DebugMode();
