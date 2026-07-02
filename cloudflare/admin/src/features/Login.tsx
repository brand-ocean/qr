import { useAuthActions } from '@convex-dev/auth/react';
import { useConvexAuth } from 'convex/react';
import { useState, type FormEvent } from 'react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';

type Flow = 'signIn' | 'signUp';

// Convex Auth surfaces credential failures as raw server errors. Map the common
// ones to human Dutch messages; never leak the raw stack.
function friendlyError(message: string, flow: Flow): string {
  if (
    message.includes('InvalidSecret') ||
    message.includes('InvalidAccountId')
  ) {
    return flow === 'signIn'
      ? 'Onjuist e-mailadres of wachtwoord.'
      : 'Account aanmaken mislukt.';
  }
  if (message.includes('already exists')) {
    return 'Er bestaat al een account met dit e-mailadres.';
  }
  if (message.includes('geen account aanmaken')) {
    return 'Dit e-mailadres mag geen account aanmaken.';
  }
  return 'Er ging iets mis. Probeer het opnieuw.';
}

export function Login() {
  const { signIn } = useAuthActions();
  // Redirect happens reactively via <Authenticated> once this flips.
  useConvexAuth();
  const [flow, setFlow] = useState<Flow>('signIn');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    const form = new FormData(event.currentTarget);
    try {
      await signIn('password', {
        email: String(form.get('email')),
        password: String(form.get('password')),
        flow,
      });
    } catch (err) {
      setError(friendlyError(err instanceof Error ? err.message : '', flow));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-svh items-center justify-center p-6">
      <Card className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center text-center">
          <img
            src="/virals-logo.png"
            alt="Virals"
            className="mb-3 h-24 w-auto"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {flow === 'signIn'
              ? 'Log in om kaarten te beheren'
              : 'Account aanmaken'}
          </p>
        </div>
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="password">Wachtwoord</Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              autoComplete={
                flow === 'signIn' ? 'current-password' : 'new-password'
              }
            />
          </div>
          {error ? (
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          ) : null}
          <Button type="submit" isLoading={submitting}>
            {flow === 'signIn' ? 'Inloggen' : 'Account aanmaken'}
          </Button>
        </form>
        <button
          type="button"
          className="mt-4 w-full text-center text-sm text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50"
          onClick={() => {
            setError(null);
            setFlow(flow === 'signIn' ? 'signUp' : 'signIn');
          }}
        >
          {flow === 'signIn'
            ? 'Nog geen account? Account aanmaken'
            : 'Al een account? Inloggen'}
        </button>
      </Card>
    </div>
  );
}
