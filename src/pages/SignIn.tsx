import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ui/Toast';
import SoloBuildLogo from '../components/ui/SoloBuildLogo';

// Inline brand SVG icons — OAuth placeholder buttons
const GoogleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 18 18" fill="none" aria-hidden="true" focusable="false">
    <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908C16.658 14.132 17.64 11.824 17.64 9.2Z" fill="#4285F4"/>
    <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" fill="#34A853"/>
    <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z" fill="#FBBC05"/>
    <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z" fill="#EA4335"/>
  </svg>
);

const MicrosoftIcon = () => (
  <svg width="16" height="16" viewBox="0 0 21 21" fill="none" aria-hidden="true" focusable="false">
    <rect x="1" y="1" width="9" height="9" fill="#F25022"/>
    <rect x="11" y="1" width="9" height="9" fill="#7FBA00"/>
    <rect x="1" y="11" width="9" height="9" fill="#00A4EF"/>
    <rect x="11" y="11" width="9" height="9" fill="#FFB900"/>
  </svg>
);

const SignIn: React.FC = () => {
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [error, setError]       = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await login({ email, password });
      if (remember) localStorage.setItem('remember_user', email);
      navigate('/', { replace: true });
    } catch (submitError) {
      const msg = submitError instanceof Error ? submitError.message : 'Unable to sign in. Please try again.';
      setError(msg);
      showToast(msg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card auth-card--signin">

        {/* Logo */}
        <div className="auth-logo">
          <SoloBuildLogo height={52} />
        </div>

        {/* Heading */}
        <h1 className="auth-title">Sign in to SoloBuildAI</h1>
        <p className="auth-subtitle">
          Don&apos;t have an account?{' '}
          <Link to="/signup">Sign up</Link>
        </p>

        {/* Social OAuth — placeholders, no backend wired yet */}
        <div className="auth-social-row">
          <button type="button" className="auth-social-button">
            <GoogleIcon />
            Google
          </button>
          <button type="button" className="auth-social-button">
            <MicrosoftIcon />
            Microsoft
          </button>
        </div>

        {/* Divider */}
        <div className="auth-divider">
          <span className="auth-divider__line" />
          <span className="auth-divider__text">or continue with</span>
          <span className="auth-divider__line" />
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="auth-form">

          <div className="auth-field">
            <label htmlFor="signin-email">Work Email</label>
            <input
              id="signin-email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(''); }}
              placeholder="you@company.com"
              className="auth-input"
            />
          </div>

          <div className="auth-field">
            <label htmlFor="signin-password">Password</label>
            <input
              id="signin-password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(''); }}
              placeholder="••••••••"
              className="auth-input"
            />
          </div>

          {error && (
            <p className="auth-error" role="alert">{error}</p>
          )}

          <div className="auth-row">
            <label className="auth-remember">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
              />
              <span>Remember me</span>
            </label>
            {/* Forgot password — placeholder, no backend reset flow yet */}
            <button type="button" className="auth-forgot">
              Forgot password?
            </button>
          </div>

          <button type="submit" className="auth-primary-button" disabled={isSubmitting}>
            {isSubmitting ? 'Signing In...' : 'Sign In'}
          </button>

        </form>
      </div>
    </div>
  );
};

export default SignIn;
