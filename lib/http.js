export function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ...headers },
  });
}

export function redirect(location, headers = {}) {
  return new Response(null, {
    status: 302,
    headers: { Location: location, ...headers },
  });
}

export function siteOrigin(request) {
  const url = new URL(request.url);
  return url.origin;
}

export function errorMessage(error) {
  return error?.message || String(error);
}