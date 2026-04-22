import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

export default function Login() {
  const { login } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();
  const toast     = useToast();
  const from      = location.state?.from?.pathname || '/';

  const [form, setForm]   = useState({ email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      setError('Please fill in both email and password.');
      return;
    }
    setLoading(true);
    try {
      await login(form.email.trim(), form.password);
      toast.success('Welcome back!');
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* warm background wash */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-accent-50 via-canvas to-canvas" />
        <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-accent/15 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-accent/10 blur-3xl" />
      </div>

      <div className="w-full max-w-md">
        <div className="paper-card p-8 sm:p-10 relative">
          <span className="tape" />

          <div className="text-center mb-7">
            <div className="grid h-12 w-12 mx-auto place-items-center rounded-full bg-ink text-canvas font-display text-xl font-bold mb-3 relative">
              B
              <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-accent ring-2 ring-canvas-card" />
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-ink">
              Welcome back
            </h1>
            <p className="mt-1 font-hand text-lg text-accent-dark">good to see you again ✦</p>
          </div>

          {error && (
            <div className="rounded-[12px] border border-red-200 bg-red-50 px-4 py-3 mb-5 flex items-center gap-2 text-sm text-red-700">
              <span className="grid h-5 w-5 place-items-center rounded-full bg-red-500 text-white text-xs">!</span>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div>
              <label htmlFor="email" className="label">Email address</label>
              <input
                id="email"
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className="input-field"
                placeholder="you@example.com"
                autoComplete="email"
                data-testid="login-email"
                required
              />
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="label !mb-1.5">Password</label>
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="text-xs font-semibold text-ink-muted hover:text-accent-dark"
                  aria-pressed={showPw}
                >
                  {showPw ? 'Hide' : 'Show'}
                </button>
              </div>
              <input
                id="password"
                type={showPw ? 'text' : 'password'}
                name="password"
                value={form.password}
                onChange={handleChange}
                className="input-field"
                placeholder="••••••••"
                autoComplete="current-password"
                data-testid="login-password"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full !py-3 mt-2"
              data-testid="login-submit"
            >
              {loading ? (
                <>
                  <span className="spinner" />
                  Signing in…
                </>
              ) : (
                <>Sign in</>
              )}
            </button>
          </form>

          <div className="my-6 flex items-center gap-3 text-xs text-ink-subtle">
            <span className="h-px flex-1 bg-line" />
            <span className="uppercase tracking-wider">New here?</span>
            <span className="h-px flex-1 bg-line" />
          </div>

          <Link
            to="/register"
            state={{ from: location.state?.from }}
            className="btn-secondary w-full !py-3"
            data-testid="login-create-account"
          >
            Create an account
          </Link>

          <p className="mt-6 text-center text-xs text-ink-subtle">
            By continuing, you agree to BASERA’s small set of community guidelines.
          </p>
        </div>
      </div>
    </div>
  );
}
