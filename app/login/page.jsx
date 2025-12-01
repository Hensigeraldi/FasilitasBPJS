'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        Cookies.set('user', JSON.stringify(data.data), { expires: 7 });
        router.push('/dashboard');
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Terjadi kesalahan koneksi');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="dark-login-page">
      {/* Complex Animated Background */}
      <div className="dark-bg-layer-1"></div>
      <div className="dark-bg-layer-2"></div>
      <div className="dark-bg-glow dark-bg-glow-1"></div>
      <div className="dark-bg-glow dark-bg-glow-2"></div>
      <div className="dark-bg-glow dark-bg-glow-3"></div>
      
      {/* Geometric Patterns */}
      <div className="dark-geometric-grid"></div>
      <div className="dark-floating-orbs">
        <div className="dark-orb dark-orb-1"></div>
        <div className="dark-orb dark-orb-2"></div>
        <div className="dark-orb dark-orb-3"></div>
      </div>

      {/* Main Content Container */}
      <div className="dark-login-wrapper">
        {/* Left Section - Branding */}
        <div className="dark-branding-section">
          <div className="dark-brand-content">
            {/* BPJS Logo */}
            <div className="dark-logo-container">
              <div className="dark-logo-glow"></div>
              <svg className="dark-bpjs-logo" viewBox="0 0 120 120" fill="none">
                <rect x="10" y="10" width="100" height="100" rx="20" fill="url(#logoGradient)" />
                <path d="M40 45 L40 75 M40 45 L55 45 C62 45 62 60 55 60 L40 60 M55 60 C62 60 62 75 55 75 L40 75" 
                      stroke="#0a0f1a" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                <defs>
                  <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#00ff9d" />
                    <stop offset="100%" stopColor="#00b374" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            
            <div className="dark-brand-text">
              <h1 className="dark-brand-title">BPJS Ketenagakerjaan</h1>
              <p className="dark-brand-tagline">Sistem Manajemen Inventaris</p>
              <div className="dark-brand-divider"></div>
              <p className="dark-brand-desc">Kelola barang masuk, keluar, dan perpindahan antar lantai secara efisien dan terorganisir</p>
            </div>

            {/* Feature Highlights */}
            <div className="dark-features-list">
              <div className="dark-feature-item">
                <div className="dark-feature-icon">
                  <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                </div>
                <span>Pencatatan Barang Masuk & Keluar</span>
              </div>
              <div className="dark-feature-item">
                <div className="dark-feature-icon">
                  <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                </div>
                <span>Tracking Perpindahan Antar Lantai</span>
              </div>
              <div className="dark-feature-item">
                <div className="dark-feature-icon">
                  <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <span>Manajemen Inventaris Terpusat</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Section - Login Form */}
        <div className="dark-form-section">
          <div className="dark-form-card">
            <div className="dark-form-header">
              <div className="dark-access-badge">
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span>Secure Access</span>
              </div>
              <h2 className="dark-form-title">Akses Administrator</h2>
              <p className="dark-form-subtitle">Masukkan kredensial Anda untuk melanjutkan</p>
            </div>

            <form onSubmit={handleSubmit} className="dark-login-form">
              {/* Error Message */}
              {error && (
                <div className="dark-alert-error">
                  <div className="dark-alert-icon">
                    <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <span>{error}</span>
                </div>
              )}

              {/* Username Field */}
              <div className="dark-input-group">
                <label htmlFor="username" className="dark-input-label">
                  <span>Username</span>
                  <span className="dark-required">*</span>
                </label>
                <div className="dark-input-container">
                  <div className="dark-input-icon-wrapper">
                    <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <input
                    id="username"
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className={`dark-input ${error ? 'dark-input-error' : ''}`}
                    placeholder="Masukkan username Anda"
                    required
                    autoComplete="username"
                  />
                  <div className="dark-input-border"></div>
                </div>
              </div>

              {/* Password Field */}
              <div className="dark-input-group">
                <label htmlFor="password" className="dark-input-label">
                  <span>Password</span>
                  <span className="dark-required">*</span>
                </label>
                <div className="dark-input-container">
                  <div className="dark-input-icon-wrapper">
                    <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                    </svg>
                  </div>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className={`dark-input ${error ? 'dark-input-error' : ''}`}
                    placeholder="Masukkan password Anda"
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="dark-password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                  >
                    {showPassword ? (
                      <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                  <div className="dark-input-border"></div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="dark-submit-btn"
              >
                <div className="dark-btn-bg"></div>
                <div className="dark-btn-content">
                  {isLoading ? (
                    <>
                      <div className="dark-spinner"></div>
                      <span>Memverifikasi...</span>
                    </>
                  ) : (
                    <>
                      <span>Masuk ke Sistem</span>
                      <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </>
                  )}
                </div>
              </button>
            </form>

            {/* Footer */}
            <div className="dark-form-footer">
              <div className="dark-footer-divider"></div>
              <div className="dark-footer-content">
                <p className="dark-footer-text">© 2024 BPJS Ketenagakerjaan. All rights reserved.</p>
                <div className="dark-version-badge">
                  <svg width="12" height="12" fill="currentColor" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="3" />
                    <path d="M12 1v6m0 6v6m9-11h-6m-6 0H3" />
                  </svg>
                  <span>v2.0.1</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}