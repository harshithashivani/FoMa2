import { useState, type CSSProperties, type FormEvent } from 'react';
import { Factory } from 'lucide-react';
import { login, register, type AuthUser } from '../lib/api';

type Props = {
  onAuthenticated: (user: AuthUser) => void;
};

export function LoginView({ onAuthenticated }: Props) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      const user =
        mode === 'login' ? await login(email, password) : await register(email, password, name);
      onAuthenticated(user);
    } catch {
      setError(
        mode === 'login'
          ? 'Incorrect email or password.'
          : 'Could not create account — that email may already be registered.'
      );
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

        <h2 style={{ margin: '0 0 4px' }}>{mode === 'login' ? 'Sign in' : 'Create account'}</h2>
        <p style={{ margin: '0 0 20px', color: '#666', fontSize: 14 }}>
          {mode === 'login'
            ? 'Sign in to access the FoMa Ops dashboard.'
            : 'Set up a new operator account.'}
        </p>

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

          {error && <p style={{ color: '#c0392b', fontSize: 13, margin: 0 }}>{error}</p>}

          <button className="primary-button" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'}
          </button>
        </form>

        <p style={{ marginTop: 18, fontSize: 13, textAlign: 'center', color: '#666' }}>
          {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <button
            type="button"
            onClick={() => {
              setError('');
              setMode(mode === 'login' ? 'register' : 'login');
            }}
            style={{ background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', padding: 0, font: 'inherit' }}
          >
            {mode === 'login' ? 'Create one' : 'Sign in'}
          </button>
        </p>

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