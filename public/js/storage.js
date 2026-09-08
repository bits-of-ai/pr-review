const KEYS = {
  anthropicKey: "prreview.anthropicKey",
  openaiKey: "prreview.openaiKey",
  provider: "prreview.provider",
  model: "prreview.model",
  repo: "prreview.repo",
  rememberKeys: "prreview.rememberKeys",
};

function store(remember) {
  return remember ? localStorage : sessionStorage;
}

function read(key) {
  return sessionStorage.getItem(key) ?? localStorage.getItem(key);
}

function write(key, value, remember) {
  const target = store(remember);
  const other = remember ? sessionStorage : localStorage;
  other.removeItem(key);
  if (value == null || value === "") {
    target.removeItem(key);
    return;
  }
  target.setItem(key, value);
}

export function rememberSecrets() {
  return localStorage.getItem(KEYS.rememberKeys) === "1";
}

export function setRememberSecrets(on) {
  if (on) localStorage.setItem(KEYS.rememberKeys, "1");
  else localStorage.removeItem(KEYS.rememberKeys);
}

export function getProviderKey(provider) {
  return read(provider === "openai" ? KEYS.openaiKey : KEYS.anthropicKey) || "";
}

export function setProviderKey(provider, key, remember = rememberSecrets()) {
  write(provider === "openai" ? KEYS.openaiKey : KEYS.anthropicKey, key, remember);
}

export function getPrefs() {
  return {
    provider: localStorage.getItem(KEYS.provider) || "anthropic",
    model: localStorage.getItem(KEYS.model) || "",
    repo: localStorage.getItem(KEYS.repo) || "",
  };
}

export function setPrefs(prefs) {
  if (prefs.provider) localStorage.setItem(KEYS.provider, prefs.provider);
  if (prefs.model) localStorage.setItem(KEYS.model, prefs.model);
  if (prefs.repo != null) localStorage.setItem(KEYS.repo, prefs.repo);
}