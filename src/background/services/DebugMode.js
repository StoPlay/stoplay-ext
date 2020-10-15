const KEY = 'debug_mode';

function DebugMode() {
  const debug_mode = window.localStorage.getItem(KEY);

  return debug_mode;
}

export default DebugMode();
