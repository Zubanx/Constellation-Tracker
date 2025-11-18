import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './ConfirmEmail.css';

const ConfirmEmail: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  
  // ✅ Prevent double API calls
  const hasCalledAPI = useRef(false);

  useEffect(() => {
    const confirmEmail = async () => {
      const token = searchParams.get('token');
      
      if (!token) {
        setStatus('error');
        setMessage('Invalid confirmation link. No token provided.');
        return;
      }

      // ✅ Prevent double calls
      if (hasCalledAPI.current) {
        console.log('⚠️ API already called, skipping duplicate request');
        return;
      }
      
      hasCalledAPI.current = true;
      console.log('🔵 Calling confirm email API...');

      try {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
        
        // Call your backend API to confirm email
        const response = await fetch(
          `${API_URL}api/user/confirm-email/${token}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );
        
        const data = await response.json();
        
        if (response.ok && data.status === 'success') {
          setStatus('success');
          setMessage('Email verified successfully! You can now log in with your credentials.');
          
          // Redirect to login page after 3 seconds with success message
          setTimeout(() => {
            navigate('/login', { 
              state: { 
                emailConfirmed: true,
                message: 'Your email has been verified! Please log in with your credentials.' 
              } 
            });
          }, 3000);
        } else {
          setStatus('error');
          setMessage(data.message || 'Verification failed. Please try again.');
        }
      } catch (error) {
        console.error('Confirmation error:', error);
        setStatus('error');
        setMessage('An error occurred during verification. Please try again.');
      }
    };

    confirmEmail();
  }, [searchParams, navigate]); // Only run when searchParams or navigate changes

  return (
    <div className="confirm-email-container">
      <div className="stars"></div>
      <div className="stars2"></div>
      <div className="stars3"></div>
      
      <div className="container">
        <div className="row justify-content-center align-items-center min-vh-100">
          <div className="col-md-6 col-lg-5">
            <div className="card confirmation-card shadow-lg">
              <div className="card-body p-5 text-center">
                
                {/* Loading State */}
                {status === 'loading' && (
                  <>
                    <div className="spinner-container mb-4">
                      <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </div>
                    <h2 className="confirmation-title mb-3">Verifying Your Email</h2>
                    <p className="text-muted">Please wait while we confirm your email address...</p>
                  </>
                )}
                
                {/* Success State */}
                {status === 'success' && (
                  <>
                    <div className="success-icon mb-4">
                      <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
                        <circle cx="40" cy="40" r="38" stroke="#28a745" strokeWidth="4" fill="rgba(40, 167, 69, 0.1)" />
                        <path d="M25 40 L35 50 L55 30" stroke="#28a745" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <h2 className="confirmation-title text-success mb-3">Email Verified! ✅</h2>
                    <p className="confirmation-message mb-3">{message}</p>
                    <p className="text-muted small">Redirecting to login page...</p>
                    <div className="mt-3">
                      <div className="spinner-border spinner-border-sm text-success me-2" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                      <span className="text-muted small">You'll be redirected in a moment</span>
                    </div>
                    
                    {/* Manual redirect option */}
                    <div className="mt-4">
                      <Link 
                        to="/login" 
                        state={{ 
                          emailConfirmed: true,
                          message: 'Your email has been verified! Please log in.' 
                        }}
                        className="btn btn-success"
                      >
                        Go to Login Now
                      </Link>
                    </div>
                  </>
                )}
                
                {/* Error State */}
                {status === 'error' && (
                  <>
                    <div className="error-icon mb-4">
                      <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
                        <circle cx="40" cy="40" r="38" stroke="#dc3545" strokeWidth="4" fill="rgba(220, 53, 69, 0.1)" />
                        <path d="M30 30 L50 50 M50 30 L30 50" stroke="#dc3545" strokeWidth="4" strokeLinecap="round" />
                      </svg>
                    </div>
                    <h2 className="confirmation-title text-danger mb-3">Verification Failed ❌</h2>
                    <p className="confirmation-message mb-4">{message}</p>
                    
                    <div className="d-grid gap-2">
                      <Link to="/login" className="btn btn-primary">
                        Go to Login
                      </Link>
                      <button 
                        className="btn btn-outline-secondary"
                        onClick={() => window.location.reload()}
                      >
                        Try Again
                      </button>
                    </div>
                    
                    <div className="mt-4">
                      <p className="text-muted small">
                        Token expired or invalid?{' '}
                        <Link to="/register" className="text-decoration-none">
                          Register again
                        </Link>
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmEmail;