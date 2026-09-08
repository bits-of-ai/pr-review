import { onRequestGet as configGet } from "../functions/api/config.js";
import { onRequestGet as sessionGet } from "../functions/api/session.js";
import { onRequestGet as oauthStart } from "../functions/api/oauth/start.js";
import { onRequestGet as oauthCallback } from "../functions/api/oauth/callback.js";
import { onRequestPost as authToken } from "../functions/api/auth/token.js";
import { onRequestPost as authLogout } from "../functions/api/auth/logout.js";
import { onRequestPost as reviewPost } from "../functions/api/review.js";
import { onRequestPost as commentPost } from "../functions/api/comment.js";
import { json } from "../lib/http.js";

const GET = {
  "/api/config": configGet,
  "/api/session": sessionGet,
  "/api/oauth/start": oauthStart,
  "/api/oauth/callback": oauthCallback,
};

const POST = {
  "/api/auth/token": authToken,
  "/api/auth/logout": authLogout,
  "/api/review": reviewPost,
  "/api/comment": commentPost,
};

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname.replace(/\/$/, "") || "/";

    if (path.startsWith("/api")) {
      const table = request.method === "GET" ? GET : request.method === "POST" ? POST : null;
      const handler = table?.[path];
      if (!handler) return json({ error: "Not found" }, 404);
      return handler({ request, env, waitUntil: ctx.waitUntil.bind(ctx) });
    }

    return env.ASSETS.fetch(request);
  },
};
