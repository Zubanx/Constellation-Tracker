import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './EmailSent.css';

const EmailSent: React.FC = () => {
  const location = useLocation();
  const email = location.state?.email || 'your email';

  return (
    <div className="email-sent-container">
      <div className="stars"></div>
      <div className="stars2"></div>
      <div className="stars3"></div>
      
      <div className="container">
        <div className="row justify-content-center align-items-center min-vh-100">
          <div className="col-md-8 col-lg-6">
            <div className="card email-sent-card shadow-lg">
              <div className="card-body p-5 text-center">
                
                {/* Email Icon */}
                <div className="email-icon mb-4">
                  <svg width="100" height="100" viewBox="0 0 100 100" fill="none">
                    <circle cx="50" cy="50" r="48" fill="rgba(65, 88, 208, 0.1)" stroke="#4158D0" strokeWidth="2"/>
                    <rect x="25" y="35" width="50" height="35" rx="2" fill="white" stroke="#4158D0" strokeWidth="2"/>
                    <path d="M25 38 L50 53 L75 38" stroke="#4158D0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                    <circle cx="70" cy="40" r="8" fill="#28a745">
                      <animate attributeName="r" values="8;10;8" dur="2s" repeatCount="indefinite"/>
                    </circle>
                    <path d="M67 40 L69 42 L73 38" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                  </svg>
                </div>

                {/* Title */}
                <h2 className="email-sent-title mb-3">Check Your Email! 📧</h2>
                
                {/* Message */}
                <p className="email-sent-message mb-4">
                  We've sent a confirmation email to <strong>{email}</strong>
                </p>

                {/* Instructions Card */}
                <div className="instructions-card mb-4">
                  <h5 className="instructions-title mb-3">What's Next?</h5>
                  <ol className="instructions-list text-start">
                    <li className="mb-2">
                      <span className="step-number">1</span>
                      Check your inbox (and spam folder)
                    </li>
                    <li className="mb-2">
                      <span className="step-number">2</span>
                      Click the confirmation link in the email
                    </li>
                    <li>
                      <span className="step-number">3</span>
                      Log in and start tracking the stars!
                    </li>
                  </ol>
                </div>

                {/* Info Box */}
                <div className="info-box mb-4">
                  <div className="info-icon">⏰</div>
                  <div className="info-text">
                    <strong>Link expires in 24 hours</strong>
                    <p className="mb-0 small">
                      If you don't receive the email within a few minutes, check your spam folder.
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="d-grid gap-2 mb-3">
                  <Link to="/login" className="btn btn-primary btn-lg">
                    Go to Login
                  </Link>
                </div>

                {/* Resend option */}
                <div className="resend-section">
                  <p className="text-muted mb-2">Didn't receive the email?</p>
                  <Link 
                    to="/resend-confirmation" 
                    state={{ email }}
                    className="text-decoration-none fw-semibold"
                  >
                    Resend confirmation email
                  </Link>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailSent;