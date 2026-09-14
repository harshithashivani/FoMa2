import { useState, type CSSProperties, type FormEvent } from 'react';
import { Factory } from 'lucide-react';
import { login, register, resetPassword, type AuthUser } from '../lib/api';

type Props = {
  onAuthenticated: (user: AuthUser) => void;
};

type Mode = 'login' | 'register' | 'reset';

export function LoginView({ onAuthenticated }: Props) {
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [resetDone, setResetDone] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function switchMode(next: Mode) {
    setError('');
    setResetDone(false);
    setMode(next);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      if (mode === 'login') {
        onAuthenticated(await login(email, password));
      } else if (mode === 'register') {
        onAuthenticated(await register(email, password, name));
      } else {
        await resetPassword(email, newPassword);
        setResetDone(true);
      }
    } catch {
      if (mode === 'login') setError('Incorrect email or password.');
      else if (mode === 'register') setError('Could not create account — that email may already be registered.');
      else setError('Could not reset password — check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f5f6f8',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 380,
          background: '#fff',
          borderRadius: 12,
          padding: '32px 28px',
          boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
          <div className="brand-mark"><Factory size={23} /></div>
          <strong style={{ fontSize: 20 }}>FoMa</strong>
        </div>

        <h2 style={{ margin: '0 0 4px' }}>
          {mode === 'login' ? 'Sign in' : mode === 'register' ? 'Create account' : 'Reset password'}
        </h2>
        <p style={{ margin: '0 0 20px', color: '#666', fontSize: 14 }}>
          {mode === 'login'
            ? 'Sign in to access the FoMa Ops dashboard.'
            : mode === 'register'
              ? 'Set up a new operator account.'
              : 'Enter your account email and choose a new password.'}
        </p>

        {mode === 'reset' && resetDone ? (
          <div>
            <p style={{ fontSize: 14, color: '#1a7a3c', margin: '0 0 16px' }}>
              Password updated. You can sign in with your new password now.
            </p>
            <button className="primary-button" type="button" onClick={() => switchMode('login')}>
              Back to sign in
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {mode === 'register' && (
              <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 13 }}>
                Name
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Alex Rivera"
                  required
                  style={inputStyle}
                />
              </label>
            )}
            <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 13 }}>
              Email
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                style={inputStyle}
              />
            </label>

            {mode !== 'reset' && (
              <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 13 }}>
                Password
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={8}
                  style={inputStyle}
                />
              </label>
            )}

            {mode === 'reset' && (
              <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 13 }}>
                New password
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={8}
                  style={inputStyle}
                />
              </label>
            )}

            {mode === 'login' && (
              <button
                type="button"
                onClick={() => switchMode('reset')}
                style={{ alignSelf: 'flex-end', background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', padding: 0, fontSize: 12 }}
              >
                Forgot password?
              </button>
            )}

            {error && <p style={{ color: '#c0392b', fontSize: 13, margin: 0 }}>{error}</p>}

            <button className="primary-button" type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? 'Please wait…'
                : mode === 'login'
                  ? 'Sign in'
                  : mode === 'register'
                    ? 'Create account'
                    : 'Reset password'}
            </button>
          </form>
        )}

        {!(mode === 'reset' && resetDone) && (
          <p style={{ marginTop: 18, fontSize: 13, textAlign: 'center', color: '#666' }}>
            {mode === 'login' && (
              <>
                Don't have an account?{' '}
                <button type="button" onClick={() => switchMode('register')} style={linkStyle}>Create one</button>
              </>
            )}
            {mode === 'register' && (
              <>
                Already have an account?{' '}
                <button type="button" onClick={() => switchMode('login')} style={linkStyle}>Sign in</button>
              </>
            )}
            {mode === 'reset' && (
              <button type="button" onClick={() => switchMode('login')} style={linkStyle}>Back to sign in</button>
            )}
          </p>
        )}

        {mode === 'login' && (
          <p style={{ marginTop: 12, fontSize: 12, textAlign: 'center', color: '#999' }}>
            Demo account: manager@foma.example / foma-demo-123
          </p>
        )}
      </div>
    </div>
  );
}

const inputStyle: CSSProperties = {
  padding: '10px 12px',
  borderRadius: 8,
  border: '1px solid #ddd',
  fontSize: 14,
};

const linkStyle: CSSProperties = {
  background: 'none',
  border: 'none',
  color: '#2563eb',
  cursor: 'pointer',
  padding: 0,
  font: 'inherit',
};