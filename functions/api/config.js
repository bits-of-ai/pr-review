import { json } from "../../lib/http.js";
import { oauthConfigured, hostedKeys } from "../../lib/session.js";

export async function onRequestGet({ env }) {
  return json({
    oauthConfigured: oauthConfigured(env),
    hostedKeys: hostedKeys(env),
  });
}