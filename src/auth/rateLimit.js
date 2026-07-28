const STORAGE_PREFIX = "billwise.auth.cooldown";

export const AUTH_COOLDOWNS = {
  signIn: 3,
  signUp: 60,
  recover: 60,
  updatePassword: 5,
};

function storageKey(action) {
  return `${STORAGE_PREFIX}.${action}`;
}

function readExpiry(action) {
  try {
    return Number(window.localStorage.getItem(storageKey(action)) || 0);
  } catch {
    return 0;
  }
}

export function getCooldownSeconds(action) {
  return Math.max(0, Math.ceil((readExpiry(action) - Date.now()) / 1000));
}

export function startCooldown(action, overrideSeconds) {
  const seconds = overrideSeconds ?? AUTH_COOLDOWNS[action] ?? 3;
  const expiresAt = Date.now() + seconds * 1000;

  try {
    window.localStorage.setItem(storageKey(action), String(expiresAt));
  } catch {
    // A blocked storage API should not prevent authentication.
  }

  return seconds;
}

export function isRateLimitError(error) {
  const message = error?.message?.toLowerCase() || "";
  return (
    error?.status === 429 ||
    message.includes("rate limit") ||
    message.includes("too many requests") ||
    error?.code?.includes("rate_limit")
  );
}

export function getSafeAuthError(error) {
  if (isRateLimitError(error)) {
    return "Too many attempts. Please wait a minute before trying again.";
  }

  const message = error?.message?.toLowerCase() || "";

  if (message.includes("email not confirmed")) {
    return "Confirm your email address before signing in.";
  }

  if (
    message.includes("invalid login credentials") ||
    message.includes("invalid credentials")
  ) {
    return "The email or password is incorrect.";
  }

  if (message.includes("user already registered")) {
    return "An account with this email already exists. Try signing in instead.";
  }

  if (message.includes("password")) {
    return "The password does not meet the account security requirements.";
  }

  return "Authentication could not be completed. Please try again.";
}
