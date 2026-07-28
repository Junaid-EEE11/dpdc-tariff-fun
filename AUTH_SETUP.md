# Billwise Authentication Setup

Billwise uses Supabase Auth for hosted email/password accounts. The calculator is protected until a valid session exists. Supabase stores credentials and sessions; the app never stores or processes password hashes itself.

## 1. Create the free project

1. Create or sign in to a Supabase account at <https://supabase.com>.
2. Create a free project.
3. In **Authentication → Sign In / Providers**, keep Email enabled.
4. Keep **Confirm email** enabled for production.
5. In **Authentication → URL Configuration**, set **Site URL** to the production site.
6. Add the local URL (normally `http://localhost:5173/**`) and any exact production/preview URLs to **Redirect URLs**.

The Supabase free plan currently includes 50,000 monthly active users. Free projects can pause after a week of inactivity, so check the current plan terms before relying on it for a critical production service.

## 2. Configure browser-safe environment values

Copy `.env.example` to `.env` and fill in values from the project's **Connect** or **Settings → API Keys** area:

```dotenv
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_your_key
```

Restart Vite after changing `.env`.

Only use a publishable key (or legacy `anon` key if the project has not migrated). Never expose a secret or `service_role` key in a `VITE_` variable, source file, browser, or static hosting configuration.

## 3. Email delivery

Supabase's built-in email sender is suitable for initial testing but is currently limited to two email-sending requests per hour across a project. Configure a custom SMTP provider in Supabase before a real production launch. The provider-side confirmation and recovery endpoints also enforce per-user cooldowns.

## 4. Rate limits and abuse protection

There are two layers:

- Supabase Auth applies the authoritative server-side limits and returns HTTP 429 when exceeded.
- Billwise adds a usability cooldown: 3 seconds for sign-in, 60 seconds for signup/recovery email, and 5 seconds for password updates. Cooldown expiry is stored locally so reloading does not immediately repeat a request.

The client cooldown is not a security boundary and can be bypassed; provider-side rate limiting remains mandatory. Review the project's **Authentication → Rate Limits** page before launch. Add CAPTCHA or stronger protections if the public sign-up endpoint attracts abuse.

## 5. Session behavior

- The Supabase browser client persists and refreshes the session automatically.
- One auth-state subscription restores the initial session and handles sign-in, sign-out, refresh, and password-recovery events.
- Sign-out uses local scope, ending only the current browser session.
- The calculator is not rendered until authentication configuration and a valid user session exist.
- Password reset links return to the app and open the new-password screen.

## 6. Production checklist

- Use HTTPS for the deployed site.
- Keep email confirmation enabled.
- Configure exact production redirect URLs rather than a broad wildcard.
- Configure reliable custom SMTP.
- Review Supabase Auth rate limits and attack-protection settings.
- Never add privileged keys to frontend variables.
- If application tables are added later, enable Row Level Security and write least-privilege policies before browser access.
- Run `npm run lint` and `npm run build` after configuration changes.
