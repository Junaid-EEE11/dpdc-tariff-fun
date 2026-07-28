import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  LoaderCircle,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { useAuth } from "./AuthContext.jsx";
import {
  getCooldownSeconds,
  getSafeAuthError,
  isRateLimitError,
  startCooldown,
} from "./rateLimit.js";
import "./auth.css";

const MIN_PASSWORD_LENGTH = 10;

function useCooldown(action) {
  const [, setTimerTick] = useState(0);
  const remaining = getCooldownSeconds(action);

  useEffect(() => {
    if (remaining <= 0) return undefined;
    const timer = window.setTimeout(() => {
      setTimerTick((value) => value + 1);
    }, 1000);
    return () => window.clearTimeout(timer);
  }, [remaining]);

  return {
    remaining,
    begin(seconds) {
      startCooldown(action, seconds);
      setTimerTick((value) => value + 1);
    },
  };
}

function Brand() {
  return (
    <div className="auth-brand" aria-label="Billwise">
      <span><Activity size={23} /></span>
      <div>
        <strong>billwise</strong>
        <small>DPDC tariff calculator</small>
      </div>
    </div>
  );
}

function AuthLoading() {
  return (
    <main className="auth-page auth-loading" aria-live="polite">
      <Brand />
      <LoaderCircle size={28} className="auth-spinner" aria-hidden="true" />
      <p>Restoring your secure session…</p>
    </main>
  );
}

function ConfigurationRequired() {
  return (
    <main className="auth-page">
      <section className="auth-card setup-card">
        <Brand />
        <span className="auth-kicker"><ShieldCheck size={15} /> Secure setup required</span>
        <h1>Connect Billwise to Supabase Auth.</h1>
        <p>
          Create a free Supabase project, then add its project URL and browser-safe
          publishable key to a local <code>.env</code> file.
        </p>
        <pre><code>{`VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_your_key`}</code></pre>
        <p className="auth-security-note">
          Never put a Supabase secret or service-role key in this frontend.
          Restart the development server after saving the environment values.
        </p>
      </section>
    </main>
  );
}

function PasswordField({ value, onChange, label = "Password", autoComplete }) {
  const [visible, setVisible] = useState(false);

  return (
    <label className="auth-field">
      <span>{label}</span>
      <span className="auth-input-shell">
        <LockKeyhole size={17} aria-hidden="true" />
        <input
          type={visible ? "text" : "password"}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          autoComplete={autoComplete}
          minLength={MIN_PASSWORD_LENGTH}
          required
        />
        <button
          type="button"
          onClick={() => setVisible((current) => !current)}
          aria-label={visible ? "Hide password" : "Show password"}
        >
          {visible ? <EyeOff size={17} /> : <Eye size={17} />}
        </button>
      </span>
    </label>
  );
}

function AuthScreen() {
  const { signIn, signUp, requestPasswordReset } = useAuth();
  const [mode, setMode] = useState("signIn");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const action = mode === "recover" ? "recover" : mode;
  const cooldown = useCooldown(action);

  const submitLabel = useMemo(() => {
    if (mode === "signUp") return "Create secure account";
    if (mode === "recover") return "Send reset link";
    return "Sign in to Billwise";
  }, [mode]);

  const switchMode = (nextMode) => {
    setMode(nextMode);
    setPassword("");
    setConfirmPassword("");
    setMessage("");
    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");

    const normalizedEmail = email.trim().toLowerCase();
    const waiting = getCooldownSeconds(action);
    if (waiting > 0) {
      setError(`Please wait ${waiting} seconds before trying again.`);
      return;
    }

    if (mode !== "recover" && password.length < MIN_PASSWORD_LENGTH) {
      setError(`Use at least ${MIN_PASSWORD_LENGTH} characters for your password.`);
      return;
    }

    if (mode === "signUp" && password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    cooldown.begin();
    setBusy(true);

    try {
      if (mode === "recover") {
        const { error: requestError } = await requestPasswordReset(normalizedEmail);
        if (requestError) throw requestError;
        setMessage(
          "If an account exists for that email, a password-reset link is on its way.",
        );
      } else if (mode === "signUp") {
        const { data, error: signUpError } = await signUp(normalizedEmail, password);
        if (signUpError) throw signUpError;
        if (!data.session) {
          setMessage("Account created. Check your inbox to confirm your email.");
        }
      } else {
        const { error: signInError } = await signIn(normalizedEmail, password);
        if (signInError) throw signInError;
      }
    } catch (authError) {
      if (isRateLimitError(authError)) cooldown.begin(60);
      setError(getSafeAuthError(authError));
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-card">
        <Brand />
        <span className="auth-kicker"><ShieldCheck size={15} /> Protected estimates</span>
        <h1>
          {mode === "signUp"
            ? "Create your Billwise account."
            : mode === "recover"
              ? "Reset your password."
              : "Welcome back to Billwise."}
        </h1>
        <p className="auth-intro">
          {mode === "recover"
            ? "Enter your email and we’ll send one secure reset link."
            : "Sign in once and your session stays active securely on this device."}
        </p>

        {mode !== "recover" && (
          <div className="auth-tabs" role="tablist" aria-label="Authentication mode">
            <button
              type="button"
              className={mode === "signIn" ? "active" : ""}
              onClick={() => switchMode("signIn")}
              role="tab"
              aria-selected={mode === "signIn"}
            >
              Sign in
            </button>
            <button
              type="button"
              className={mode === "signUp" ? "active" : ""}
              onClick={() => switchMode("signUp")}
              role="tab"
              aria-selected={mode === "signUp"}
            >
              Create account
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <label className="auth-field">
            <span>Email address</span>
            <span className="auth-input-shell">
              <Mail size={17} aria-hidden="true" />
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
                required
              />
            </span>
          </label>

          {mode !== "recover" && (
            <PasswordField
              value={password}
              onChange={setPassword}
              autoComplete={mode === "signUp" ? "new-password" : "current-password"}
            />
          )}

          {mode === "signUp" && (
            <PasswordField
              label="Confirm password"
              value={confirmPassword}
              onChange={setConfirmPassword}
              autoComplete="new-password"
            />
          )}

          {mode === "signUp" && (
            <small className="password-rule">
              Use at least {MIN_PASSWORD_LENGTH} characters. Passwords are hashed and
              managed by Supabase Auth.
            </small>
          )}

          {error && <p className="auth-alert error" role="alert">{error}</p>}
          {message && (
            <p className="auth-alert success" role="status">
              <CheckCircle2 size={16} /> {message}
            </p>
          )}

          <button
            className="auth-submit"
            type="submit"
            disabled={busy || cooldown.remaining > 0}
          >
            {busy ? <LoaderCircle size={18} className="auth-spinner" /> : <Zap size={18} />}
            {cooldown.remaining > 0 && !busy
              ? `Try again in ${cooldown.remaining}s`
              : submitLabel}
            {!busy && cooldown.remaining === 0 && <ArrowRight size={17} />}
          </button>
        </form>

        {mode === "signIn" && (
          <button className="auth-text-button" type="button" onClick={() => switchMode("recover")}>
            Forgot your password?
          </button>
        )}
        {mode === "recover" && (
          <button className="auth-text-button" type="button" onClick={() => switchMode("signIn")}>
            Return to sign in
          </button>
        )}

        <div className="auth-trust-row">
          <span><ShieldCheck size={16} /> Provider-side abuse protection</span>
          <span><KeyRound size={16} /> Persistent secure session</span>
        </div>
      </section>
    </main>
  );
}

function UpdatePasswordScreen() {
  const { updatePassword, completePasswordRecovery } = useAuth();
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [updated, setUpdated] = useState(false);
  const cooldown = useCooldown("updatePassword");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(`Use at least ${MIN_PASSWORD_LENGTH} characters.`);
      return;
    }
    if (password !== confirmation) {
      setError("Passwords do not match.");
      return;
    }

    cooldown.begin();
    setBusy(true);
    const { error: updateError } = await updatePassword(password);
    setBusy(false);

    if (updateError) {
      setError(getSafeAuthError(updateError));
      return;
    }

    setUpdated(true);
  };

  if (updated) {
    return (
      <main className="auth-page">
        <section className="auth-card auth-confirmation">
          <Brand />
          <CheckCircle2 size={42} />
          <h1>Password updated.</h1>
          <p>Your account is secure and ready to use.</p>
          <button className="auth-submit" type="button" onClick={completePasswordRecovery}>
            Continue to Billwise <ArrowRight size={17} />
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <Brand />
        <span className="auth-kicker"><KeyRound size={15} /> Password recovery</span>
        <h1>Choose a new password.</h1>
        <p className="auth-intro">Use a unique password with at least {MIN_PASSWORD_LENGTH} characters.</p>
        <form className="auth-form" onSubmit={handleSubmit}>
          <PasswordField value={password} onChange={setPassword} autoComplete="new-password" />
          <PasswordField label="Confirm new password" value={confirmation} onChange={setConfirmation} autoComplete="new-password" />
          {error && <p className="auth-alert error" role="alert">{error}</p>}
          <button className="auth-submit" type="submit" disabled={busy || cooldown.remaining > 0}>
            {busy ? <LoaderCircle size={18} className="auth-spinner" /> : <LockKeyhole size={18} />}
            {cooldown.remaining > 0 && !busy ? `Try again in ${cooldown.remaining}s` : "Update password"}
          </button>
        </form>
      </section>
    </main>
  );
}

export function AuthGate({ children }) {
  const { configured, loading, user, passwordRecovery } = useAuth();

  if (!configured) return <ConfigurationRequired />;
  if (loading) return <AuthLoading />;
  if (passwordRecovery) return <UpdatePasswordScreen />;
  if (!user) return <AuthScreen />;
  return children;
}
