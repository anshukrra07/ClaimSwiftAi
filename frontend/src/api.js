const TOKEN_KEY = "claimswift.session.token";

let sessionToken = typeof window !== "undefined" ? window.localStorage.getItem(TOKEN_KEY) || "" : "";

function setSessionToken(token) {
  sessionToken = token || "";
  if (typeof window !== "undefined") {
    if (sessionToken) window.localStorage.setItem(TOKEN_KEY, sessionToken);
    else window.localStorage.removeItem(TOKEN_KEY);
  }
}

async function request(path, options = {}) {
  const response = await fetch(`/api${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(sessionToken ? { Authorization: `Bearer ${sessionToken}` } : {}),
      ...(options.headers || {}),
    },
    ...options,
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    if (response.status === 401) setSessionToken("");
    throw new Error(data.error || `Request failed with status ${response.status}`);
  }

  return data;
}

export const api = {
  hasSession() {
    return Boolean(sessionToken);
  },
  async login(email, password) {
    const data = await request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    setSessionToken(data.token);
    return data;
  },
  getMe() {
    return request("/auth/me");
  },
  async logout() {
    try {
      return await request("/auth/logout", {
        method: "POST",
      });
    } finally {
      setSessionToken("");
    }
  },
  getBootstrap() {
    return request("/bootstrap");
  },
  getPlatformOps() {
    return request("/platform/ops");
  },
  getAuditEvents() {
    return request("/audit/events");
  },
  analyzeIntake(payload) {
    return request("/intake/analyze", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  createClaim(payload) {
    return request("/claims", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  submitClarification(claimId, payload) {
    return request(`/claims/${claimId}/clarifications`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  reviewClaim(claimId, payload) {
    return request(`/claims/${claimId}/review`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  settleClaim(claimId) {
    return request(`/claims/${claimId}/settle`, {
      method: "POST",
    });
  },
  savePolicyRules(payload) {
    return request("/policy/rules", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
};
