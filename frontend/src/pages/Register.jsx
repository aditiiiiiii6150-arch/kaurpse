import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

const MIN_PW = 6;

function passwordStrength(pw) {
  let score = 0;
  if (!pw) return { score, label: '', color: 'bg-line' };
  if (pw.length >= MIN_PW) score++;
  if (pw.length >= 10) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  const map = [
    { label: 'Too short',  color: 'bg-red-400' },
    { label: 'Weak',       color: 'bg-red-400' },
    { label: 'Okay',       color: 'bg-amber-400' },
    { label: 'Good',       color: 'bg-accent-dark' },
    { label: 'Strong',     color: 'bg-emerald-500' },
    { label: 'Very strong',color: 'bg-emerald-600' },
  ];
  return { score, ...map[Math.min(score, map.length - 1)] };
}

export default function Register() {
  const { register } = useAuth();
  const navigate     = useNavigate();
  const toast        = useToast();

  const [form, setForm]   = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    role: 'seeker',
  });
  const [showPw, setShowPw]   = useState(false);
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);

  const strength = useMemo(() => passwordStrength(form.password), [form.password]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    setError('');
  };

  const validate = () => {
    if (!form.name.trim())                   return 'Please enter your full name.';
    if (!form.email.trim())                  return 'Please enter your email address.';
    if (form.password.length < MIN_PW)       return `Password must be at least ${MIN_PW} characters.`;
    if (form.password !== form.confirmPassword) return 'Passwords do not match.';
    if (!form.phone.trim())                  return 'Please enter your phone number.';
    if (!/^\d{10}$/.test(form.phone.replace(/\s/g, ''))) return 'Enter a valid 10-digit phone number.';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) { setError(validationError); return; }

    setLoading(true);
    try {
      const { confirmPassword, ...payload } = form;
      payload.email = payload.email.trim();
      payload.phone = payload.phone.replace(/\s/g, '');
      await register(payload);
      toast.success('Welcome to BASERA!');
      navigate(form.role === 'owner' ? '/dashboard' : '/listings', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 relative overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-accent-50 via-canvas to-canvas" />
        <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-accent/15 blur-3xl" />
        <div className="absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-accent/10 blur-3xl" />
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
              Join BASERA
            </h1>
            <p className="mt-1 font-hand text-lg text-accent-dark">a calmer way to land somewhere ✿</p>
          </div>

          {error && (
            <div className="rounded-[12px] border border-red-200 bg-red-50 px-4 py-3 mb-5 flex items-center gap-2 text-sm text-red-700">
              <span className="grid h-5 w-5 place-items-center rounded-full bg-red-500 text-white text-xs">!</span>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {/* Role selector */}
            <div>
              <label className="label">I am a…</label>
              <div className="grid grid-cols-2 gap-3" role="radiogroup">
                {[
                  { v: 'seeker', emoji: '🔍', label: 'Room seeker' },
                  { v: 'owner',  emoji: '🏠', label: 'Room owner'  },
                ].map(({ v, emoji, label }) => (
                  <label
                    key={v}
                    className={`relative cursor-pointer rounded-[14px] border-2 p-3.5 transition-all ${
                      form.role === v
                        ? 'border-accent bg-accent-50 shadow-soft'
                        : 'border-line bg-canvas-card hover:border-accent/60'
                    }`}
                  >
                    <input
                      type="radio"
                      name="role"
                      value={v}
                      checked={form.role === v}
                      onChange={handleChange}
                      className="sr-only"
                      data-testid={`role-${v}`}
                    />
                    <div className="flex items-center gap-2.5">
                      <span className="text-xl">{emoji}</span>
                      <span className={`font-semibold text-sm ${form.role === v ? 'text-ink' : 'text-ink-soft'}`}>
                        {label}
                      </span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="reg-name" className="label">Full name</label>
              <input
                id="reg-name" type="text" name="name"
                value={form.name} onChange={handleChange}
                className="input-field" placeholder="Rahul Negi"
                autoComplete="name" data-testid="reg-name" required
              />
            </div>

            <div>
              <label htmlFor="reg-email" className="label">Email address</label>
              <input
                id="reg-email" type="email" name="email"
                value={form.email} onChange={handleChange}
                className="input-field" placeholder="you@example.com"
                autoComplete="email" data-testid="reg-email" required
              />
            </div>

            <div>
              <label htmlFor="reg-phone" className="label">Phone number</label>
              <div className="flex">
                <span className="inline-flex items-center px-3 border border-r-0 border-line bg-canvas-soft text-ink-muted text-sm rounded-l-[10px]">
                  +91
                </span>
                <input
                  id="reg-phone" type="tel" name="phone"
                  value={form.phone} onChange={handleChange}
                  className="input-field rounded-l-none"
                  placeholder="9876543210" maxLength={10}
                  autoComplete="tel-national"
                  data-testid="reg-phone" required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="reg-password" className="label !mb-1.5">Password</label>
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
                id="reg-password" type={showPw ? 'text' : 'password'} name="password"
                value={form.password} onChange={handleChange}
                className="input-field" placeholder={`Min. ${MIN_PW} characters`}
                autoComplete="new-password" data-testid="reg-password" required
              />
              {form.password && (
                <div className="mt-2">
                  <div className="flex gap-1" aria-hidden>
                    {[0, 1, 2, 3, 4].map((i) => (
                      <span
                        key={i}
                        className={`h-1.5 flex-1 rounded-full transition-colors ${i < strength.score ? strength.color : 'bg-line'}`}
                      />
                    ))}
                  </div>
                  <p className="mt-1 text-[11px] text-ink-muted">{strength.label}</p>
                </div>
              )}
            </div>

            <div>
              <label htmlFor="reg-confirm" className="label">Confirm password</label>
              <input
                id="reg-confirm" type={showPw ? 'text' : 'password'} name="confirmPassword"
                value={form.confirmPassword} onChange={handleChange}
                className="input-field" placeholder="Repeat password"
                autoComplete="new-password" data-testid="reg-confirm" required
              />
              {form.confirmPassword && form.password !== form.confirmPassword && (
                <p className="mt-1 text-[11px] text-red-500">Passwords don’t match yet.</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full !py-3 mt-1"
              data-testid="reg-submit"
            >
              {loading ? (
                <>
                  <span className="spinner" />
                  Creating account…
                </>
              ) : (
                'Create account'
              )}
            </button>
          </form>

          <p className="text-center text-sm text-ink-muted mt-6">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-accent-dark hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
