import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ui/Toast';
import SoloBuildLogo from '../components/ui/SoloBuildLogo';

const SignUp: React.FC = () => {
  const { register } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [fullName, setFullName]           = useState('');
  const [email, setEmail]                 = useState('');
  const [password, setPassword]           = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError]                 = useState('');
  const [isSubmitting, setIsSubmitting]   = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    try {
      await register({ name: fullName, email, password, timezone: 'UTC' });
      navigate('/', { replace: true });
    } catch (submitError) {
      const msg = submitError instanceof Error ? submitError.message : 'Unable to create your account. Please try again.';
      setError(msg);
      showToast(msg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card auth-card--signup">

        <div className="auth-logo">
          <SoloBuildLogo height={52} />
        </div>

        <h1 className="auth-title">Create your account</h1>
        <p className="auth-subtitle">Tell us about yourself and what you&apos;re building.</p>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-form-grid">

            <div className="auth-field">
              <label htmlFor="su-fullname">Full Name *</label>
              <input
                id="su-fullname"
                type="text"
                required
                autoComplete="name"
                value={fullName}
                onChange={(event) => { setFullName(event.target.value); setError(''); }}
                placeholder="Jane Smith"
                className="auth-input"
              />
            </div>

            <div className="auth-field">
              <label htmlFor="su-email">Work Email *</label>
              <input
                id="su-email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(event) => { setEmail(event.target.value); setError(''); }}
                placeholder="you@company.com"
                className="auth-input"
              />
            </div>

            <div className="auth-field">
              <label htmlFor="su-password">Password *</label>
              <input
                id="su-password"
                type="password"
                required
                minLength={8}
                autoComplete="new-password"
                value={password}
                onChange={(event) => { setPassword(event.target.value); setError(''); }}
                placeholder="Minimum 8 characters"
                className="auth-input"
              />
            </div>

            <div className="auth-field">
              <label htmlFor="su-confirm">Confirm Password *</label>
              <input
                id="su-confirm"
                type="password"
                required
                minLength={8}
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(event) => { setConfirmPassword(event.target.value); setError(''); }}
                placeholder="Repeat password"
                className="auth-input"
              />
            </div>

          </div>

          {error && <p className="auth-error" role="alert">{error}</p>}

          <button type="submit" className="auth-primary-button" disabled={isSubmitting}>
            {isSubmitting ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <p className="auth-footer" style={{marginTop: '20px'}}>
          Already have an account?{' '}
          <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default SignUp;
