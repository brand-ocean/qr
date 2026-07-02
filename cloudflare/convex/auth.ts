import { Password } from '@convex-dev/auth/providers/Password';
import { convexAuth } from '@convex-dev/auth/server';

// Only these emails may create an account. Set on the Convex deployment with:
//   npx convex env set ADMIN_EMAILS "you@example.com,teammate@example.com"
// If unset, sign-up is closed entirely (existing accounts can still sign in).
function allowedEmails(): ReadonlySet<string> {
  const raw = process.env.ADMIN_EMAILS ?? '';
  return new Set(
    raw
      .split(',')
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean),
  );
}

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [
    Password({
      // Restrict account creation to the allowlist. Runs on both sign-up and
      // sign-in; on sign-in the account already exists, so this only actually
      // blocks new-account creation for non-allowlisted emails.
      profile(params) {
        const email = String(params.email ?? '')
          .trim()
          .toLowerCase();
        const allowed = allowedEmails();
        if (!allowed.has(email)) {
          throw new Error('Dit e-mailadres mag geen account aanmaken.');
        }
        return { email };
      },
    }),
  ],
});
