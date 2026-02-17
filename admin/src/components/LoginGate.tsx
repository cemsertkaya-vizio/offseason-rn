import { useState, type FormEvent, type ReactNode } from 'react';

const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD;
const SESSION_KEY = 'offseason_admin_auth';

interface LoginGateProps {
  children: ReactNode;
}

export default function LoginGate({ children }: LoginGateProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => sessionStorage.getItem(SESSION_KEY) === 'true'
  );
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      sessionStorage.setItem(SESSION_KEY, 'true');
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('Invalid password');
    }
  };

  if (isAuthenticated) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-darkBrown">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-sm"
      >
        <h1 className="text-2xl font-bold text-brand-darkBrown mb-1">
          Offseason Admin
        </h1>
        <p className="text-brand-grayMuted text-sm mb-6">
          Enter password to continue
        </p>

        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Admin password"
          className="w-full px-4 py-3 rounded-lg border border-brand-grayMedium
                     focus:outline-none focus:border-brand-darkBrown
                     text-brand-darkBrown placeholder-brand-grayMuted"
          autoFocus
        />

        {error && (
          <p className="text-red-500 text-sm mt-2">{error}</p>
        )}

        <button
          type="submit"
          className="w-full mt-4 py-3 rounded-lg bg-brand-darkBrown text-white
                     font-semibold hover:opacity-90 transition-opacity"
        >
          Sign In
        </button>
      </form>
    </div>
  );
}
