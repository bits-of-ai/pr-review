const KEYS = {
  provider: "prreview.provider",
  model: "prreview.model",
  repo: "prreview.repo",
  rememberKeys: "prreview.rememberKeys",
};

const LEGACY_KEY = {
  anthropic: "prreview.anthropicKey",
  openai: "prreview.openaiKey",
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

function keySlot(provider) {
  return `prreview.key.${provider}`;
}

export function rememberSecrets() {
  return localStorage.getItem(KEYS.rememberKeys) === "1";
}

export function setRememberSecrets(on) {
  if (on) localStorage.setItem(KEYS.rememberKeys, "1");
  else localStorage.removeItem(KEYS.rememberKeys);
}

export function getProviderKey(provider) {
  const current = read(keySlot(provider));
  if (current) return current;
  const legacy = LEGACY_KEY[provider];
  return (legacy && read(legacy)) || "";
}

export function setProviderKey(provider, key, remember = rememberSecrets()) {
  write(keySlot(provider), key, remember);
  if (LEGACY_KEY[provider]) write(LEGACY_KEY[provider], key, remember);
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
